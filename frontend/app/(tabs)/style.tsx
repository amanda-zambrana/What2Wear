import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useRef } from 'react';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function StyleScreen() {
  const [activeView, setActiveView] = useState('outfit shuffle');
  const modalizeRef = useRef<Modalize>(null);

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  // Rendering the outfit shuffle view
  const renderOutfitShuffleView = () => (
    <View>
      <Text style={styles.text}>Outfit Shuffle Details Here</Text>
    </View>
  );

  // Rendering the smart shuffle view
  const renderSmartShuffleView = () => (
    <View>
      <Text style={styles.text}>Smart Shuffle Details Here</Text>
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

        {/* Buttons to switch views */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              activeView === 'outfit shuffle' && styles.activeButton,
            ]}
            onPress={() => setActiveView('outfit shuffle')}
          >
            <Text
              style={[
                styles.buttonText,
                activeView === 'outfit shuffle' && styles.activeButtonText,
              ]}
            >
              Outfit Shuffle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              activeView === 'smart shuffle' && styles.activeButton,
            ]}
            onPress={() => setActiveView('smart shuffle')}
          >
            <Text
              style={[
                styles.buttonText,
                activeView === 'smart shuffle' && styles.activeButtonText,
              ]}
            >
              Smart Shuffle
            </Text>
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
    backgroundColor: '#3dc8ff', // Teal stripe
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative', // Allows positioning the menu button
    marginBottom: 20,
    paddingBottom: 10,
  },
  headerText: {
    color: '#000000', // Black text
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
  text: {
    color: '#000',
    fontSize: 18,
    textAlign: 'center', // Add styling for text
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
});
