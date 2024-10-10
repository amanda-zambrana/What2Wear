import React, { useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';

export default function Index() {
  const modalizeRef = useRef<Modalize>(null);

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Hey, User!</Text>
        <TouchableOpacity style={styles.menuButton} onPress={onOpen}>
          <Text style={styles.menuText}>⋮</Text>
        </TouchableOpacity>
      </View>

      <Modalize
        ref={modalizeRef}
        snapPoint={300} // halfway up the screen
        modalHeight={400}
      >
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
    justifyContent: 'center', // Center the text
    marginBottom: 20,
    position: 'relative', // Allows positioning the menu
  },
  headerText: {
    color: '#000000',
    fontSize: 28,
    fontWeight: 'bold',
  },
  menuButton: {
    position: 'absolute',
    right: 20, // Position the menu on the right
    top: 40, // Adjust according to the header height
  },
  menuText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
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
