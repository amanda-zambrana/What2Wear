import { Text, View, StyleSheet, Button, TouchableOpacity} from 'react-native';
import React, { useState } from 'react';

export default function WardrobeScreen() {
  const [activeView, setActiveView] = useState('inventory');

  // Rendering the inventory view
  const renderInventoryView = () => (
    <View>
      <Text style={styles.text}>Inventory</Text>
      {/* Later, add the clothes list component or logic here */}
    </View>
  );

  // Rendering the outfits view
  const renderOutfitsView = () => (
    <View>
      <Text style={styles.text}>Outfits</Text>
      {/* Later, add the outfits list component or logic here */}
    </View>
  );

  // Rendering the style boards view
  const renderStyleBoardsView = () => (
    <View>
      <Text style={styles.text}>Style Boards</Text>
      {/* Later, add the style boards list component or logic here */}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/*later, link the username here via database*/}
        <Text style={styles.headerText}>John Doe</Text> 
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
          <Text style={[
            styles.buttonText,
            activeView === 'inventory' && styles.activeButtonText,
          ]}>Inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            activeView === 'outfits' && styles.activeButton,
          ]}
          onPress={() => setActiveView('outfits')}
        >
          <Text style={[
            styles.buttonText,
            activeView === 'outfits' && styles.activeButtonText,
          ]}>Outfits</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            activeView === 'style boards' && styles.activeButton,
          ]}
          onPress={() => setActiveView('style boards')}
        >
          <Text style={[
            styles.buttonText,
            activeView === 'style boards' && styles.activeButtonText,
          ]}>Style Boards</Text>
        </TouchableOpacity>
      </View>

      {/* Conditionally render the view based on user selection */}
      {activeView === 'inventory' ? (renderInventoryView()) : 
        activeView === 'outfits' ? (renderOutfitsView()) : 
        (renderStyleBoardsView())}
    </View>
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
    marginBottom: 20, // Pushing the next container items down from the header
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
});