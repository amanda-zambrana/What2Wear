import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useRef } from 'react';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function WardrobeScreen() {
  const [activeView, setActiveView] = useState('inventory');
  const modalizeRef = useRef<Modalize>(null);

  const onOpen = () => {
    modalizeRef.current?.open();
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
          <Text style={styles.headerText}>User Name</Text>
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
    height: 110,
    backgroundColor: '#3dc8ff', // Teal stripe
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    marginBottom: 20,
    position: 'relative', // Allows positioning the menu button
  },
  headerText: {
    color: '#000',
    fontSize: 32,
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
    backgroundColor: '#3dc8ff', // Teal color for the active button
  },
  activeButtonText: {
    color: '#fff', // White text for the active button
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
});
