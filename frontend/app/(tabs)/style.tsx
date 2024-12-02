import { Text, View, StyleSheet, TouchableOpacity, Image, Modal, Alert, Button, TextInput, FlatList } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import ViewShot from 'react-native-view-shot';

interface WardrobeItem {
  id: string;
  name: string;
  imageUrl: string;
  category: string; 
}

type ItemsByCategory = {
  [key: string]: WardrobeItem[];
  tops: WardrobeItem[];
  bottoms: WardrobeItem[];
  footwear: WardrobeItem[];
  accessories: WardrobeItem[];
  outerwear: WardrobeItem[];
};

type smartOutfit = {
  accessories?: WardrobeItem[] | null;
  outerwear?: WardrobeItem | null;
  top?: WardrobeItem | null;
  bottom?: WardrobeItem | null;
  shoe?: WardrobeItem | null;
};

export default function StyleScreen() {
  const [activeView, setActiveView] = useState('outfit shuffle');
  const modalizeRef = useRef<Modalize>(null);
  const actionSheetRef = useRef<Modalize>(null); 
  const screenshotRef = useRef<ViewShot | null>(null);

  const [shuffledOutfit, setShuffledOutfit] = useState<(WardrobeItem | null)[]>([]);
  const [outfitName, setOutfitName] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);

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
    if (Object.keys(wardrobeItems).length > 0) {
      setShuffledOutfit(shuffleOutfit());
    }
  }, [wardrobeItems]);

  // Fetch the user's items from Firestore based on the item categories (5)
  const fetchWardrobeItems = async () => {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error("No user is currently signed in.");
        return;
      }

      const wardrobeRef = collection(getFirestore(), `users/${userId}/wardrobe`);
      const wardrobeSnapshot = await getDocs(wardrobeRef);

      const itemsByCategory: ItemsByCategory = {
        tops: [],
        bottoms: [],
        footwear: [],
        accessories: [],
        outerwear: [],
      };

      wardrobeSnapshot.forEach(doc => {
        const data = doc.data() as WardrobeItem;
        const category = data.category;
        if (itemsByCategory[category]) {
          itemsByCategory[category].push(data);
        }
      });

      setWardrobeItems(itemsByCategory);
      console.log('Fetched items by category:', itemsByCategory);
    } catch (error) {
      console.error("Error fetching wardrobe items:", error);
    }
  };

  // Basic outfit shuffle to create a style 
  const shuffleOutfit = (): (WardrobeItem | null)[] => {
    return categories.map(category => {
      const items = wardrobeItems[category] || [];
      return items.length > 0 ? items[Math.floor(Math.random() * items.length)] : null;
    }).filter(item => item !== null) as WardrobeItem[];
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
    const auth = getAuth();
    const user = auth.currentUser;
    const storage = getStorage();
    const db = getFirestore();

    if (!screenshotUri || !outfitName) {
      console.error("Please provide a name for the outfit");
      return;
    }

    if (user && screenshotUri) {
      try {
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
    } else {
      console.error("User is not authenticated or no image selected.");
    }
  };

  // new logic for depreciated react-native-view-shot compatibility
  const captureScreenshot = async () => {
    if (screenshotRef.current) {
      try {
        const uri = await (screenshotRef.current.capture ? screenshotRef.current.capture() : null);
        setScreenshotUri(uri);
        setModalVisible(true); // Show modal after taking screenshot
      } catch (error) {
        console.error("Failed to capture screenshot:", error);
      }
    }
  };

  // Function to fetch wardrobe items from Firestore for smart AI shuffle
  const fetchWardrobeItemsSmart = async (): Promise<WardrobeItem[]> => {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('User is not authenticated');
        return [];
      }
  
      const db = getFirestore();
      const wardrobeRef = collection(db, `users/${userId}/wardrobe`);
      const snapshot = await getDocs(wardrobeRef);
  
      const wardrobeItems = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          imageUrl: data.imageUrl,
          category: data.category, // Directly assign category as a string
        } as WardrobeItem;
      });
  
      // Log wardrobe items for debugging
      console.log('Fetched wardrobe items:', wardrobeItems);
  
      return wardrobeItems;
    } catch (error) {
      console.error('Error fetching wardrobe items:', error);
      return [];
    }
  };

    // Function to find outfit matches and reorder them
  const findOutfitMatches = (wardrobeItems: WardrobeItem[]): smartOutfit | null => {
    // Categorize items by category
    const accessories = wardrobeItems.filter(item => item.category === 'accessories');
    const outerwear = wardrobeItems.filter(item => item.category === 'outerwear');
    const tops = wardrobeItems.filter(item => item.category === 'tops');
    const bottoms = wardrobeItems.filter(item => item.category === 'bottoms');
    const shoes = wardrobeItems.filter(item => item.category === 'footwear');
  
    console.log('Filtered categories:', { accessories, outerwear, tops, bottoms, shoes });
  
    // Check if all required categories have items in the user's inventory
    if (!tops.length || !bottoms.length) {
      Alert.alert('Error', 'Not enough wardrobe items to generate outfits!');
      return null;
    }
  
    // Generate a single smart outfit suggestion
    const accessory = accessories.length ? accessories[Math.floor(Math.random() * accessories.length)] : null;
    const outerwearItem = outerwear.length ? outerwear[Math.floor(Math.random() * outerwear.length)] : null;
    const top = tops[Math.floor(Math.random() * tops.length)] || null;
    const bottom = bottoms[Math.floor(Math.random() * bottoms.length)] || null;
    const shoe = shoes.length ? shoes[Math.floor(Math.random() * shoes.length)] : null;
  
    // Return the outfit in the specified order
    return { accessories: accessory ? [accessory] : [], outerwear: outerwearItem, top, bottom, shoe };
  };

  const [outfitSuggestions, setOutfitSuggestions] = useState<smartOutfit[]>([]);

      // Function to generate AI smart outfit suggestions
  const generateOutfits = async () => {
    try {
      const wardrobeItems = await fetchWardrobeItemsSmart();
      if (wardrobeItems.length === 0) {
        Alert.alert('No wardrobe items found', 'Please add items to your wardrobe to generate outfits.');
        setOutfitSuggestions([]);
        return;
      }
      const suggestion = findOutfitMatches(wardrobeItems);
      if (suggestion) {
        setOutfitSuggestions([suggestion]); // Set only one outfit instead of an array of 5
      } else {
        setOutfitSuggestions([]);
      }
    } catch (error) {
      console.error('Error generating outfit suggestions:', error);
      Alert.alert('Error', 'Failed to generate outfit suggestions.');
      setOutfitSuggestions([]);
    }
  };

  // Fetch outfit suggestions on component mount
  useEffect(() => {
    generateOutfits();
  }, []);

  // Function to render items in the desired order
  const renderItem = (item: WardrobeItem | WardrobeItem[] | null, index: number, category: string) => {
    if (!item) return null;

    // Handle the accessory case which can be an array
    if (Array.isArray(item)) {
      return item.map((accessory, i) => (
        <Image key={`${category}-${i}`} source={{ uri: accessory.imageUrl }} style={styles.image} />
      ));
    }

    // Render single item
    return <Image key={`${category}-${index}`} source={{ uri: item.imageUrl }} style={styles.image} />;
  };


    // Rendering the outfit shuffle view
  const renderOutfitShuffleView = () => (
    <ViewShot ref={screenshotRef}>

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

    </ViewShot>
  );

    // Rendering the smart shuffle view
  const renderSmartShuffleView = () => (
    <ViewShot ref={screenshotRef}>

      {/* Floating Button 1 - Apply Filters , change onFloatingButtonPress to another function when add functionality*/}
      <TouchableOpacity
        style={[styles.floatingButton, { right: 200, top: -10}]}
        onPress={onFloatingButtonPress} 
    >
        <Text style={styles.floatingButtonText}>☰</Text>
    </TouchableOpacity>

      {/* Floating Button 2 - Smart Shuffle, , change onFloatingButtonPress to another function when add functionality*/}
      <TouchableOpacity
        style={[styles.floatingButton, { right: 140, top: -10}]}
        onPress={generateOutfits}
    >
        <Text style={styles.floatingButtonText}>↻</Text>
    </TouchableOpacity>

      {/* Floating Button 3 - Save Outfit, change onFloatingButtonPress to another function when add functionality */}
      <TouchableOpacity
        style={[styles.floatingButton, { right: -120, top: -10}]}
        onPress={captureScreenshot}
    >
        <Text style={styles.floatingButtonText}>→</Text>
    </TouchableOpacity>

      <FlatList
        data={outfitSuggestions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
        <View style={styles.outfitContainer}>
            {renderItem(item.accessories ?? [], 0, 'accessories')}
            {renderItem(item.outerwear ?? null, 0, 'outerwear')}
            {renderItem(item.top ?? null, 0, 'top')}
            {renderItem(item.bottom ?? null, 0, 'bottom')}
            {renderItem(item.shoe ?? null, 0, 'shoe')}
        </View>
        )}
        />

    </ViewShot>
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
    width: 105,
    height: 105,
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
  outfitContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 0,
    borderColor: '#ddd',
    borderRadius: 5,
    alignItems: 'center', 
  },
  // for the smart shuffle wardrobe images
  image: {
    width: 100, // Adjusted size for better visibility
    height: 100,
    marginBottom: 10,
    borderRadius: 5,
    resizeMode: 'contain', // Keep aspect ratio of images
  },

});
