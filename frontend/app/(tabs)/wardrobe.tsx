import { Text, View, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import React, { useState, useRef } from 'react';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';

import { useNavigation, Stack } from 'expo-router'; // Import useNavigation from expo-router
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthUser } from '@/globalUserStorage';

// Defining the type for the navigation prop based on  routes
type RootStackParamList = {
  index: undefined;
  style: undefined; 
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'index'>;

// Define the props type
interface SearchBarProps {
    value: string; // Type for the value prop
    onChange: (text: string) => void; // Type for the onChange prop
    placeholder: string; // Type for the placeholder prop
  }

  const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => {
    return (
      <TextInput
        style={styles.searchBar}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#898989"
      />
    );
  };

export default function WardrobeScreen() {
  const [activeView, setActiveView] = useState('inventory');
  const modalizeRef = useRef<Modalize>(null); // Ref for the bottom sheet menu
  const actionSheetRef = useRef<Modalize>(null); // Ref for the floating button menu
  const profileRef = useRef<Modalize>(null); // Ref for the profile modal
  const newItemRef = useRef<Modalize>(null); // Ref for the New Item modal

  const [profileImage, setProfileImage] = useState<string | null>(null); // Store user's profile image
  const [newItemImage, setNewItemImage] = useState<string | null>(null); // Store new item image
  const [itemDetails, setItemDetails] = useState<string>(''); // Store details about the new item

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [typeOpen, setTypeOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [colorOpen, setColorOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const user =useAuthUser();
  const userDisplayName = user?.displayName || 'User';

// State variables for search bars
const [searchInventory, setSearchInventory] = useState('');
const [searchOutfits, setSearchOutfits] = useState('');
const [searchStyleBoards, setSearchStyleBoards] = useState('');


  const onOpen = () => {
    modalizeRef.current?.open();
  };

  const onFloatingButtonPress = () => {
    actionSheetRef.current?.open(); // Open the floating button modal
  };

  const onProfilePress = () => {
    profileRef.current?.open(); // Open the profile modal
  };

  // Function to select a profile image from the gallery
  const pickProfileImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri); // Update the profile image
    }
  };

  // Function to add a new item
  const addNewItem = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setNewItemImage(result.assets[0].uri); // Set new item image
      console.log("New item image URL:", result.assets[0].uri); // Log the image URL
      newItemRef.current?.open(); // Open the new item modal
    }
  };

  const buttonNames = [
    'All',
    'Outerwear',
    'Tops',
    'Bottoms ',
    'Footwear ',
    'Accessories '
];

  // Rendering the inventory view
  const renderInventoryView = () => (
    <View>
        <View style={styles.circularButtonContainer}>
            {buttonNames.map((buttonName, index) => (
                <TouchableOpacity key={index} style={styles.circularButton}>
                    <Text style={styles.buttonLabel}>{buttonName}</Text>
                </TouchableOpacity>
            ))}
        </View>
        <SearchBar
            value={searchInventory}
            onChange={setSearchInventory}
            placeholder="Search your inventory..."
        />
    </View>
);

  // Rendering the outfits view
  const renderOutfitsView = () => (
    <View>
        <SearchBar
            value={searchOutfits}
            onChange={setSearchOutfits}
            placeholder="Search your outfits..."
        />
    </View>
  );

  // Rendering the style boards view
  const renderStyleBoardsView = () => (
    <View>
        <SearchBar
        value={searchStyleBoards}
        onChange={setSearchStyleBoards}
        placeholder="Search your style boards..."
        />
    </View>
  );

  // Create a navigation reference for buttons to navigate to diff tabs 
  const navigation = useNavigation<NavigationProp>(); // Use the defined navigation prop type

  // Function to handle navigation to the "Style" tab to create a new outfit 
  const handleCreateNewOutfit = () => {
    navigation.navigate('style'); 
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
        <View style={styles.header}>
          
                {/* Profile Image */}
                <TouchableOpacity onPress={onProfilePress} style={styles.profileImageContainer}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>U</Text>
                    </View>
                    )}
          </TouchableOpacity>

          {/* User Name */}
          <Text style={styles.headerText}>{userDisplayName}</Text>

        
          {/* Menu Button */}
          <TouchableOpacity style={styles.menuButton} onPress={onOpen}>
            <Text style={styles.menuText}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs to switch views */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tab} onPress={() => setActiveView('inventory')}>
            <Text
              style={[ styles.tabText, activeView === 'inventory' && styles.activeTabText]}>
              Inventory
            </Text>
            {activeView === 'inventory' && <View style={styles.activeTabUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab} onPress={() => setActiveView('outfits')}>
            <Text
              style={[ styles.tabText, activeView === 'outfits' && styles.activeTabText ]}>
              Outfits
            </Text>
            {activeView === 'outfits' && <View style={styles.activeTabUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab} onPress={() => setActiveView('style boards')} >
            <Text
              style={[ styles.tabText, activeView === 'style boards' && styles.activeTabText ]}>
              Style Boards
            </Text>
            {activeView === 'style boards' && <View style={styles.activeTabUnderline} />}
          </TouchableOpacity>
        </View>

        {/* Conditionally render the view based on user selection */}
        {activeView === 'inventory'
          ? renderInventoryView()
          : activeView === 'outfits'
          ? renderOutfitsView()
          : renderStyleBoardsView()}

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

        {/* Floating button */}
        <TouchableOpacity style={styles.floatingButton} onPress={onFloatingButtonPress}>
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>

        {/* Modalize for the floating button menu */}
        <Modalize
          ref={actionSheetRef}
          adjustToContentHeight
          handlePosition="inside"
          overlayStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <View style={styles.menuContent}>
            <TouchableOpacity style={styles.menuOptionButton} onPress={addNewItem}>
              <Text style={styles.menuOptionText}>Add a New Item</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuOptionButton} onPress={handleCreateNewOutfit}>
              <Text style={styles.menuOptionText}>Create a New Outfit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuOptionButton}>
              <Text style={styles.menuOptionText}>Create a New Style Board</Text>
            </TouchableOpacity>
          </View>
        </Modalize>

        {/* Modalize for the user profile screen */}
        <Modalize
          ref={profileRef}
          adjustToContentHeight
          handlePosition="inside"
          overlayStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <View style={styles.profileContent}>
            <Text style={styles.profileTitle}>User Profile</Text>

            {/* User info */}
            <TouchableOpacity onPress={pickProfileImage}>
              <Image
                source={profileImage ? { uri: profileImage } : undefined}
                style={styles.profileImageLarge}
              />
            </TouchableOpacity>
            <Text style={styles.profileLabel}>Name: User Name</Text>
            <Text style={styles.profileLabel}>Username: user123</Text>
          </View>
        </Modalize>

        {/* Modal for Add a New Item */}
        <Modalize
          ref={newItemRef}
          adjustToContentHeight
          handlePosition="inside"
          overlayStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <View style={styles.scrollViewContent}>
            {newItemImage && (
              <Image
                source={{ uri: newItemImage }}
                style={styles.newItemImage}
              />
            )}

            <TextInput
              style={styles.newItemInput}
              value={itemDetails}
              onChangeText={setItemDetails}
              placeholder="Enter a name for this item..."
              placeholderTextColor={'#898989'}
            />

            {/* Category Dropdown */}
            <DropDownPicker
                open={categoryOpen}
                setOpen={setCategoryOpen}
                items={[
                  { label: 'Outerwear', value: 'outerwear' },
                  { label: 'Tops', value: 'tops' },
                  { label: 'Bottoms', value: 'bottoms' },
                  { label: 'Footwear', value: 'footwear' },
                  { label: 'Accessories', value: 'accessories' },
                ]}
                value={selectedCategory}
                setValue={setSelectedCategory}
                placeholder="Select a category"
                containerStyle={{ marginBottom: 15 }} // Adjust the spacing to prevent overlapping
                zIndex={3000} // Ensure correct stacking order
                zIndexInverse={1000}
              />

            {/* Type Dropdown */}
            <DropDownPicker
                open={typeOpen}
                setOpen={setTypeOpen}
                items={[
                  { label: 'Tee Shirt', value: 'teeshirt' },
                  { label: 'Tank Top', value: 'tanktop' },
                  { label: 'Shorts', value: 'shorts' },
                  { label: 'Pants', value: 'pants' },
                  { label: 'Sneakers', value: 'sneakers' },
                  { label: 'Sandals', value: 'sandals' },
                  { label: 'Boots', value: 'boots' },
                  { label: 'Hats', value: 'hats' },
                  { label: 'Headbands', value: 'headbands' },
                  { label: 'Jackets', value: 'jackets' },
                  { label: 'Sweaters', value: 'sweaters' },

                ]}
                value={selectedType}
                setValue={setSelectedType}
                placeholder="Select a type"
                containerStyle={{ marginBottom: 15 }} // Adjust the spacing to prevent overlapping
                zIndex={2000} // Ensure correct stacking order
                zIndexInverse={2000}
              />

            {/* Color Dropdown */}
            <DropDownPicker
                open={colorOpen}
                setOpen={setColorOpen}
                items={[
                  { label: 'Black', value: 'black' },
                  { label: 'White', value: 'white' },
                  { label: 'Gray', value: 'gray' },
                  { label: 'Red', value: 'red' },
                  { label: 'Orange', value: 'orange' },
                  { label: 'Yellow', value: 'yellow' },
                  { label: 'Green', value: 'green' },
                  { label: 'Blue', value: 'blue' },
                  { label: 'Purple', value: 'purple' },
                  { label: 'Pink', value: 'pink' },
                  { label: 'Brown', value: 'brown' },
                ]}
                value={selectedColor}
                setValue={setSelectedColor}
                placeholder="Select a color"
                containerStyle={{ marginBottom: 15 }} // Adjust the spacing to prevent overlapping
                zIndex={1000} // Ensure correct stacking order
                zIndexInverse={3000}
              />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                // Logic to save the new item goes here
                console.log("Item saved:", itemDetails);
                newItemRef.current?.close(); // Close the new item modal after saving
              }}
            >
              <Text style={styles.saveButtonText}>Add to Wardrobe</Text>
            </TouchableOpacity>

            </View>
            </Modalize>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontSize: 18,
  },
  header: {
    width: '100%',
    height: 130,
    backgroundColor: '#3dc8ff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 35,
    marginBottom: 20,
    flexDirection: 'row',
    position: 'relative',
  },
  headerText: {
    color: '#000',
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  profileImageContainer: {
    marginLeft: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 30,
    color: '#fff',
  },
  profileImageLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginVertical: 10,
  },
  profileLabel: {
    fontSize: 18,
    marginVertical: 5,
    textAlign: 'center',
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  menuButton: {
    position: 'absolute',
    right: 20,
    top: 60,
  },
  menuText: {
    fontSize: 40,
    color: '#000',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
  },
  activeButton: {
    backgroundColor: '#3dc8ff',
  },
  activeButtonText: {
    color: '#fff',
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3dc8ff',
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 30,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  menuOptionButton: {
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  menuOptionText: {
    fontSize: 18,
  },
  profileContent: {
    padding: 20,
    alignItems: 'center',
  },
  newItemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  newItemImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  itemDetailsInput: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  newItemContent: {
    flex: 1,
    padding: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // White background for the modal
  },
  newItemLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333', // Dark color for the label
  },
  newItemInput: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50', // Green background for the button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff', // White text color for the button
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  picker: {
    height: 40,
    width: 150,
    marginLeft: 10,
  },
  labelDropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  scrollViewContent: {
    padding: 45,
    alignItems: 'center',
    flexGrow: 1,
  },
  circularButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  circularButton: {
    width: 62, // Width of each button
    height: 62, // Height of each button
    borderRadius: 30, // To make the button circular
    backgroundColor: '#ffffff',
    borderColor: '#3dc8ff', 
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  buttonLabel: {
    color: '#3dc8ff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchBar: {
    alignSelf: 'center',
    height: 50,
    width: 350,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 50,
    paddingHorizontal: 5,
    marginVertical: 0,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 20,
    width: '100%',
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  
});
