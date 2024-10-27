import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useRef } from 'react';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function StyleScreen() {
  const [activeView, setActiveView] = useState('outfit shuffle');
  const modalizeRef = useRef<Modalize>(null);
  const actionSheetRef = useRef<Modalize>(null); // Ref for the floating button menu

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  const onFloatingButtonPress = () => {
    actionSheetRef.current?.open(); // Open the floating button modal
  };

  // Rendering the outfit shuffle view
  const renderOutfitShuffleView = () => (
    <View>

      {/* Floating Button 1 - Apply Filters , change onFloatingButtonPress to another function when add functionality*/}
      <TouchableOpacity
        style={[styles.floatingButton, { right: 140, top: -10}]}
        onPress={onFloatingButtonPress} 
    >
        <Text style={styles.floatingButtonText}>☰</Text>
    </TouchableOpacity>

      {/* Floating Button 2 - Shuffle, , change onFloatingButtonPress to another function when add functionality*/}
      <TouchableOpacity
        style={[styles.floatingButton, { right: 80, top: -10}]}
        onPress={onFloatingButtonPress}
    >
        <Text style={styles.floatingButtonText}>⇄</Text>
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
});
