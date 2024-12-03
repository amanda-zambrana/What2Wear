import { Text, View, StyleSheet, TouchableOpacity, FlatList, Image, TextInput, Modal } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

import { captureRef } from 'react-native-view-shot';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


// Define the WardrobeItem type
interface WardrobeItem {
    id: string;
    name: string;
    imageUrl: string;
    category: string; 
}

// Define the ItemsByCategory type
type ItemsByCategory = {
    [key: string]: WardrobeItem[]; // Allows any string key to access an array of wardrobeItems
    tops: WardrobeItem[];
    bottoms: WardrobeItem[];
    footwear: WardrobeItem[];
    accessories: WardrobeItem[];
    outerwear: WardrobeItem[];
};


export default function StyleScreen() {
  const [activeView, setActiveView] = useState('outfit shuffle');
  const modalizeRef = useRef<Modalize>(null);
  const actionSheetRef = useRef<Modalize>(null); // Ref for the floating button menu

  const [shuffledOutfit, setShuffledOutfit] = useState<(WardrobeItem | null)[]>([]);
  const [outfitName, setOutfitName] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const screenshotRef = useRef(null);

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  const onFloatingButtonPress = () => {
    actionSheetRef.current?.open(); 
  };

  const [outfit, setOutfit] = useState<WardrobeItem[]>([]); // Initialize outfit state as an array of WardrobeItem
  const [wardrobeItems, setWardrobeItems] = useState<ItemsByCategory>({
    tops: [],
    bottoms: [],
    footwear: [],
    accessories: [],
    outerwear: []
  });

  const categories = ['accessories', 'outerwear', 'tops', 'bottoms', 'footwear'];
  

  useEffect(() => {
    fetchWardrobeItems();
  }, []);


  // Use another useEffect to shuffle outfit whenever wardrobeItems changes
  useEffect(() => {
    if (Object.keys(wardrobeItems).length > 0) { // Ensure wardrobeItems is populated
        setShuffledOutfit(shuffleOutfit());
    }
  }, [wardrobeItems]);

  // Fetch the user's items from Firestore based on the item categories (5)
  const fetchWardrobeItems = async () => {
    try {
        const auth = getAuth();
        const userId = auth.currentUser?.uid; // Get the current user's ID

        if (!userId) {
            console.error("No user is currently signed in.");
            return;
        }

        const wardrobeRef = collection(getFirestore(), `users/${userId}/wardrobe`);
        const wardrobeSnapshot = await getDocs(wardrobeRef);
    
        // Initialize itemsByCategory
        const itemsByCategory: ItemsByCategory = {
            tops: [],
            bottoms: [],
            footwear: [],
            accessories: [],
            outerwear: [],
        };

        wardrobeSnapshot.forEach(doc => {
            const data = doc.data() as WardrobeItem;
            const category = data.category; // Assuming category is a string
            if (itemsByCategory[category]) {
                itemsByCategory[category].push(data); // Add the item to the appropriate category
            }
        });

        setWardrobeItems(itemsByCategory);
        // setShuffledOutfit(shuffleOutfit()); // Calling shuffleOutfit here to set an initial outfit 
        console.log('Fetched items by category:', itemsByCategory); // Check your fetched items
    } catch (error) {
        console.error("Error fetching wardrobe items:", error);
    }
};


  // Basic outfit shuffle to create a style 
  const shuffleOutfit = (): (WardrobeItem | null)[] => {
    const newOutfit: (WardrobeItem | null)[] = categories.map(category => {
        const items = wardrobeItems[category] || [];
        return items.length > 0 ? items[Math.floor(Math.random() * items.length)] : null;
    });

    // filter out null values from newOutfit
    return newOutfit.filter(item => item !== null) as WardrobeItem[]; // Return the filtered outfit instead of setting it
  };

  const handleShuffle = () => {
    setShuffledOutfit(shuffleOutfit());
  };
    

    // Render a single item in the outfit shuffle
    const renderShuffledItem = ({ item }: { item: WardrobeItem | null}) => {
        if (!item) return null;
        return (
            <View style={styles.itemContainer}>
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            </View>
        );
    };

    const handleSaveOutfit = async () => {
      // Check if the user is authenticated
      const auth = getAuth();
      const user = auth.currentUser;
      const storage = getStorage();
      const db = getFirestore();
      
      // Ensure that category, type, and color are not null or empty
      if (!screenshotUri || !outfitName ) {
          console.error("Please provide a name for the outfit");
      return;
      }
  
      if (user && screenshotUri) {
          try {
            // Fetch and validate the image
            const response = await fetch(screenshotUri);
            if (!response.ok) {
              throw new Error("Failed to fetch the image from the URI.");
            }
  
            const blob = await response.blob();
  
            // Create a storage reference for the image
            const imageRef = ref(storage, `users/${user.uid}/outfits/${Date.now()}.jpg`);
      
            // Upload image to Firebase Storage
            await uploadBytes(imageRef, blob);
      
            const downloadURL = await getDownloadURL(imageRef);
  
            // Save URL and item details to Firestore
            await addDoc(collection(db, `users/${user.uid}/outfits`), {
              imageUrl: downloadURL,
              name: outfitName,
              createdAt: new Date(),
            });
  
            console.log('Outfit uploaded and saved:', downloadURL);
  
            // Close the modal after saving item 
            setModalVisible(false);
            setOutfitName('');
            alert('Outfit saved successfully!');
          } catch (error) {
            console.error('Error saving outfit:', error);
          }
       }  else {
          console.error("User is not authenticated or no image selected.");
       }
    };

  const captureScreenshot = async () => {
    try {
      const uri = await captureRef(screenshotRef, {
        format: "jpg",
        quality: 0.8,
      });
      setScreenshotUri(uri);
      setModalVisible(true); // Show modal after taking screenshot
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
    }
  };


  // Rendering the outfit shuffle view
  const renderOutfitShuffleView = () => (
    <View ref={screenshotRef}>

      {/* Floating Button 1 - Apply Filters , change onFloatingButtonPress to another function when add functionality*/}
      <TouchableOpacity
        style={[styles.floatingButton, { right: 190, top: -10}]}
        onPress={onFloatingButtonPress} 
    >
        <Text style={styles.floatingButtonText}>☰</Text>
    </TouchableOpacity>

      {/* Floating Button 2 - Shuffle, , change onFloatingButtonPress to another function when add functionality*/}
      <TouchableOpacity
        style={[styles.floatingButton, { right: 130, top: -10}]}
        onPress={handleShuffle}
    >
        <Text style={styles.floatingButtonText} onPress={handleShuffle}>⇄</Text>
    </TouchableOpacity>

      {/* Floating Button 3 - Save Outfit, change onFloatingButtonPress to another function when add functionality */}
      <TouchableOpacity
        style={[styles.floatingButton, { right: -140, top: -10}]}
        onPress={captureScreenshot}
    >
        <Text style={styles.floatingButtonText}>→</Text>
    </TouchableOpacity>

    <FlatList
        data={shuffledOutfit}
        renderItem={renderShuffledItem}
        keyExtractor={(item, index) => item ? item.id : index.toString()}
        contentContainerStyle={styles.flatListContainer}
    />

    </View>

  );


  // Rendering the smart shuffle view
  const renderSmartShuffleView = () => (
    <View>

      {/* Floating Button 1 - Apply Filters , change onFloatingButtonPress to another function when add functionality*/}
      <TouchableOpacity
        style={[styles.floatingButton, { right: 140, top: -10}]}
        onPress={onFloatingButtonPress} 
    >
        <Text style={styles.floatingButtonText}>☰</Text>
    </TouchableOpacity>

      {/* Floating Button 2 - Smart Shuffle, , change onFloatingButtonPress to another function when add functionality*/}
      <TouchableOpacity
        style={[styles.floatingButton, { right: 80, top: -10}]}
        onPress={onFloatingButtonPress}
    >
        <Text style={styles.floatingButtonText}>↻</Text>
    </TouchableOpacity>

      {/* Floating Button 3 - Save Outfit, change onFloatingButtonPress to another function when add functionality */}
      <TouchableOpacity
        style={[styles.floatingButton, { right: -190, top: -10}]}
        onPress={onFloatingButtonPress}
    >
        <Text style={styles.floatingButtonText}>→</Text>
    </TouchableOpacity>

    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Style Your Wardrobe</Text>
          <TouchableOpacity style={styles.menuButton} onPress={onOpen}>
            <Text style={styles.menuText}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs to switch views */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveView('outfit shuffle')}
          >
            <Text
              style={[
                styles.tabText,
                activeView === 'outfit shuffle' && styles.activeTabText,
              ]}
            >
              Outfit Shuffle
            </Text>
            {activeView === 'outfit shuffle' && <View style={styles.activeTabUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveView('smart shuffle')}
          >
            <Text
              style={[
                styles.tabText,
                activeView === 'smart shuffle' && styles.activeTabText,
              ]}
            >
              Smart Shuffle
            </Text>
            {activeView === 'smart shuffle' && <View style={styles.activeTabUnderline} />}
          </TouchableOpacity>
        </View>

        {/* Conditionally render the view based on user selection */}
        {activeView === 'outfit shuffle'
          ? renderOutfitShuffleView()
          : renderSmartShuffleView()}

        {/* Modalize for bottom sheet menu */}
        <Modalize ref={modalizeRef} snapPoint={300} modalHeight={400}>
          <View style={styles.menuContent}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Share Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Get Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Modalize>

        {/* Modal for naming outfit */}
        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Name Your Outfit</Text>

              {/* Conditionally render the Image component only if screenshotUri is not null */}
              {screenshotUri ? (
                <Image source={{ uri: screenshotUri }} style={styles.screenshotPreview} />
              ) : (
                <Text>No screenshot available</Text> // Optionally, display a fallback message
              )}        

              <TextInput
                style={styles.input}
                placeholder="Enter a name for this outfit..."
                placeholderTextColor={'#898989'}
                value={outfitName}
                onChangeText={setOutfitName}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveOutfit}>
                <Text style={styles.saveButtonText}>Save Outfit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    height: 110,
    backgroundColor: '#3dc8ff', 
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative', 
    marginBottom: 20,
    paddingBottom: 10,
  },
  headerText: {
    color: '#000000', 
    fontSize: 28,
    fontWeight: 'bold',
  },
  menuButton: {
    position: 'absolute',
    right: 20, // Position the menu on the right
    top: 60, // Adjust based on header height
  },
  menuText: {
    fontSize: 40,
    color: '#000',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tab: {
    paddingVertical: 10,
  },
  tabText: {
    color: '#888', // Default text color
    fontSize: 16,
  },
  activeTabText: {
    color: '#3dc8ff', // Active text color
    fontWeight: 'bold',
  },
  activeTabUnderline: {
    marginTop: 5,
    height: 2,
    backgroundColor: '#3dc8ff', // Teal underline for active tab
  },
  text: {
    color: '#000',
    fontSize: 18,
    textAlign: 'center', 
    marginVertical: 20,
  },
  menuContent: {
    padding: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 18,
  },
  floatingButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#3dc8ff',
    alignItems: 'center',
    justifyContent: 'center',
    right: -80,
    top: -10,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  itemContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  itemText: {
    marginTop: 5,
    fontSize: 16,
  },
  flatListContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexGrow: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    height: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  screenshotPreview: {
    marginTop: 0,
    width: 70,
    height: 550,
    marginBottom: -145,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#3dc8ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButtonText: {
    color: 'red',
    marginTop: 10,
  },

});
