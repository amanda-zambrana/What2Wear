import React, { useRef, useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Calendar, DateData } from 'react-native-calendars';
import { getFirestore, collection, getDocs, query, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function Index() {
  const modalizeRef = useRef<Modalize>(null);
  const detailsModalRef = useRef<Modalize>(null);
  const [currentMonth, setCurrentMonth] = useState<string>(
    new Date().toISOString().split('T')[0].slice(0, 7)
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [outfits, setOutfits] = useState<any[]>([]);
  const [pinnedOutfits, setPinnedOutfits] = useState<Record<string, any>>({});
  const [selectedOutfitDetails, setSelectedOutfitDetails] = useState<any | null>(null);

  const auth = getAuth();
  const db = getFirestore();

  // Fetch stored outfits from Firestore
  const fetchOutfits = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const outfitsCollection = collection(db, 'users', user.uid, 'outfits');
    const q = query(outfitsCollection);
    const querySnapshot = await getDocs(q);
    const fetchedOutfits: any[] = [];
    querySnapshot.forEach((doc) => {
      fetchedOutfits.push({ id: doc.id, ...doc.data() });
    });
    setOutfits(fetchedOutfits);
  };

  // Fetch pinned outfits from Firestore
  const fetchPinnedOutfits = async () => {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      const pinnedCollection = collection(db, 'users', user.uid, 'pinnedOutfits');
      const q = query(pinnedCollection);
      const querySnapshot = await getDocs(q);
      const fetchedPinnedOutfits: Record<string, any> = {};
      querySnapshot.forEach((doc) => {
        fetchedPinnedOutfits[doc.id] = doc.data();
      });
      setPinnedOutfits(fetchedPinnedOutfits);
    } catch (error) {
      console.error('Error fetching pinned outfits:', error);
    }
  };  

  // Pin the selected outfit to the date and store it in Firestore
  const pinOutfitToDate = async (outfit: any) => {
    if (selectedDate) {
      const user = auth.currentUser;
      if (!user) return;

      // Store pinned outfit in Firestore
      const pinnedOutfitRef = doc(db, 'users', user.uid, 'pinnedOutfits', selectedDate);
      await setDoc(pinnedOutfitRef, {
        outfitId: outfit.id,
        name: outfit.name,
        imageUrl: outfit.imageUrl,
      });

      // Update state
      setPinnedOutfits((prev) => ({
        ...prev,
        [selectedDate]: outfit,
      }));
      modalizeRef.current?.close();
    }
  };

  // Remove the pinned outfit from a date and delete it from Firestore
  const removePinnedOutfit = async () => {
    if (!selectedDate) return;
  
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      // Reference to the specific pinned outfit in Firestore
      const pinnedOutfitRef = doc(db, 'users', user.uid, 'pinnedOutfits', selectedDate);
  
      // Delete the pinned outfit from Firestore
      await deleteDoc(pinnedOutfitRef);

      await fetchPinnedOutfits(); // Fetch updated pinned outfits from Firestore
  
      // Update state by removing the entry for the selected date
      setPinnedOutfits((prev) => {
        const updatedPinnedOutfits = { ...prev };
        delete updatedPinnedOutfits[selectedDate];
        return updatedPinnedOutfits;
      });
  
      // Clear modal details
      setSelectedOutfitDetails(null);
      detailsModalRef.current?.close();
    } catch (error) {
      console.error('Error removing pinned outfit:', error);
    }
  };

  // Load pinned outfits on component mount
  useEffect(() => {
    fetchPinnedOutfits();
  }, []);

  // Add this function to your existing code
  const openOutfitModal = (date: string) => {
    setSelectedDate(date);
    fetchOutfits();
    modalizeRef.current?.open();
  };
  
  // Open the details modal for a date with a pinned outfit
  const openDetailsModal = (date: string) => {
    if (pinnedOutfits[date]) {
      setSelectedDate(date); // Set the selected date here
      setSelectedOutfitDetails(pinnedOutfits[date]);
      detailsModalRef.current?.open();
    }
  };
  

  const getCurrentDateText = () => {
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' } as const;
    return today.toLocaleDateString('en-US', options);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Schedule Your Style</Text>
        </View>

        {/* Today is... */}
        <Text style={styles.todayText}>Today is {getCurrentDateText()}</Text>

        <Calendar
          current={currentMonth}
          onDayPress={(day: DateData) => {
            if (pinnedOutfits[day.dateString]) {
              openDetailsModal(day.dateString);
            } else {
              openOutfitModal(day.dateString);
            }
          }}
          markedDates={Object.keys(pinnedOutfits).reduce((acc, date) => {
            acc[date] = { marked: true, dotColor: 'blue' };
            return acc;
          }, {} as Record<string, any>)}
          style={styles.calendar}
        />

        <Text style={styles.instructionText}>Choose a date above to</Text>
        <Text style={styles.instructionText}>schedule an outfit!</Text>


        {/* Outfit selection modal */}
        <Modalize ref={modalizeRef} snapPoint={560} modalHeight={560}>
          <View style={styles.gridContainer}>
            <Text style={styles.modalTitle}>Select an Outfit for {selectedDate}</Text>
            <FlatList
                data={outfits}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => pinOutfitToDate(item)}>
                        <Image source={{ uri: item.imageUrl }} style={styles.wardrobeOutfitsImage} />
                        <Text style={styles.outfitText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.flatListContent}
            />
          </View>
        </Modalize>

        {/* Outfit details modal */}
        <Modalize ref={detailsModalRef} snapPoint={560} modalHeight={560}>
          <View style={styles.detailsModalContent}>
            {selectedOutfitDetails ? (
              <>
                <Text style={styles.modalTitle}>Selected Outfit for this date: </Text>
                <Image source={{ uri: selectedOutfitDetails.imageUrl }} style={styles.outfitImage} />
                <Text style={styles.outfitName}>{selectedOutfitDetails.name}</Text>
                <TouchableOpacity style={styles.removeButton} onPress={removePinnedOutfit}>
                  <Text style={styles.removeButtonText}>Remove Outfit</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.noOutfitText}>No outfit pinned for this date.</Text>
            )}
          </View>
        </Modalize>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    width: '100%',
    height: 110,
    backgroundColor: '#3dc8ff',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 20,
    paddingBottom: 10,
  },
  headerText: {
    color: '#000000',
    fontSize: 28,
    fontWeight: 'bold',
  },
  calendar: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 25,
    marginBottom: 30,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  outfitItem: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  outfitText: {
    fontSize: 18, 
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 1, // Ensure long text doesn't overflow
  },
  detailsModalContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  outfitImage: {
    width: '100%',
    height: 420,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'contain', // Ensure it fits within bounds
  },
  outfitName: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#ff4d4d',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noOutfitText: {
    fontSize: 16,
    color: '#333',
  },
  outfitItemWithImage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15, // Increased padding for more space
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    minHeight: 200, // Ensure the row is tall enough
  },
  outfitThumbnail: {
    width: 60, // Increased thumbnail size
    height: 150, // Increased thumbnail size
    borderRadius: 8,
    marginRight: 15, // Adjusted margin for spacing
    resizeMode: 'cover', // Ensure the image scales properly
  },
  gridContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 10, // Ensure consistent padding
  },
  wardrobeOutfitsImage: {
    width: '100%', // Each image takes up full width of the container within its cell
    height: 180,
    aspectRatio: 0.8,
    margin: 16,
    borderRadius: 10,
    borderWidth: 3, 
    borderColor: 'black', 
    resizeMode: 'contain',
    marginBottom: 10, // Space between images
    marginTop: 30,
  },
  flatListContent: {
    paddingHorizontal: 10, 
    paddingBottom: 120,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 25,
    textAlign: 'center',
    color: '#555',
    fontWeight: 'bold',
    marginTop: 10,
  },
  todayText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
});
