import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useState, useRef } from 'react';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';

export default function WardrobeScreen() {
  const [activeView, setActiveView] = useState('inventory');
  const modalizeRef = useRef<Modalize>(null); // Ref for the bottom sheet menu
  const actionSheetRef = useRef<Modalize>(null); // Ref for the floating button menu
  const profileRef = useRef<Modalize>(null); // Ref for the profile modal

  const [profileImage, setProfileImage] = useState<string | null>(null); // Store user's profile image

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

  // Rendering the inventory view
  const renderInventoryView = () => (
    <View>
      <Text style={styles.text}>Inventory</Text>
    </View>
  );

  // Rendering the outfits view
  const renderOutfitsView = () => (
    <View>
      <Text style={styles.text}>Outfits</Text>
    </View>
  );

  // Rendering the style boards view
  const renderStyleBoardsView = () => (
    <View>
      <Text style={styles.text}>Style Boards</Text>
    </View>
  );

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
          <Text style={styles.headerText}>User Name</Text>

          {/* Menu Button */}
          <TouchableOpacity style={styles.menuButton} onPress={onOpen}>
            <Text style={styles.menuText}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons to switch views */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              activeView === 'inventory' && styles.activeButton,
            ]}
            onPress={() => setActiveView('inventory')}
          >
            <Text
              style={[
                styles.buttonText,
                activeView === 'inventory' && styles.activeButtonText,
              ]}
            >
              Inventory
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              activeView === 'outfits' && styles.activeButton,
            ]}
            onPress={() => setActiveView('outfits')}
          >
            <Text
              style={[
                styles.buttonText,
                activeView === 'outfits' && styles.activeButtonText,
              ]}
            >
              Outfits
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              activeView === 'style boards' && styles.activeButton,
            ]}
            onPress={() => setActiveView('style boards')}
          >
            <Text
              style={[
                styles.buttonText,
                activeView === 'style boards' && styles.activeButtonText,
              ]}
            >
              Style Boards
            </Text>
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
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={onFloatingButtonPress}
        >
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
            <TouchableOpacity style={styles.menuOptionButton}>
              <Text style={styles.menuOptionText}>Add a New Item</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuOptionButton}>
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
});