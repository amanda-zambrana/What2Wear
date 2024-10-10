import { Text, View, StyleSheet, Button, TouchableOpacity} from 'react-native';
import React, { useState } from 'react';

export default function StyleScreen() {
  const [activeView, setActiveView] = useState('outfit shuffle');

  // Rendering the outfit shuffle view
  const renderOutfitShuffleView = () => (
    <View>
      <Text style={styles.text}>Outfit Shuffle Details Here</Text>
      {/* Later, add the outfit shuffle component or logic here */}
    </View>
  );

  // Rendering the smart shuffle view
  const renderSmartShuffleView = () => (
    <View>
      <Text style={styles.text}>Smart Shuffle Details Here</Text>
      {/* Later, add the smart shuffle component or logic here */}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Style Your Wardrobe</Text>
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
          <Text style={[
            styles.buttonText,
            activeView === 'outfit shuffle' && styles.activeButtonText,
          ]}>Outfit Shuffle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            activeView === 'smart shuffle' && styles.activeButton,
          ]}
          onPress={() => setActiveView('smart shuffle')}
        >
          <Text style={[
            styles.buttonText,
            activeView === 'smart shuffle' && styles.activeButtonText,
          ]}>Smart Shuffle</Text>
        </TouchableOpacity>

      </View>

      {/* Conditionally render the view based on user selection */}
      {activeView === 'outfit shuffle' ? (renderOutfitShuffleView()) : (renderSmartShuffleView()) }
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
    color: '#000000', // Black text
    fontSize: 28,
    fontWeight: 'bold',
  },
  text: {
    color: '#000',
    fontSize: 18,
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