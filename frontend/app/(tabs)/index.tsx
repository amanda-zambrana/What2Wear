import React, { useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

export default function Index() {
  const modalizeRef = useRef<Modalize>(null);
  const router = useRouter(); 

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  const navigateToSignup = () => {
    router.push('/auth/signup'); // Navigate to the signup screen
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Hey, User!</Text>
          <TouchableOpacity style={styles.menuButton} onPress={onOpen}>
            <Text style={styles.menuText}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Button to Navigate to Signup IMP: THIS IS TEMPORARY will change once login and auth works only for debugging purposes!!!!!! */}
        <TouchableOpacity style={styles.signupButton} onPress={navigateToSignup}>
          <Text style={styles.signupButtonText}>Go to Sign Up</Text>
        </TouchableOpacity>

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
    </GestureHandlerRootView>
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
    justifyContent: 'flex-end',
    marginBottom: 20,
    paddingBottom: 10,
    position: 'relative',
  },
  headerText: {
    color: '#000000',
    fontSize: 28,
    fontWeight: 'bold',
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
  signupButton: {
    backgroundColor: '#378fe6',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginVertical: 20,
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuContent: {
    padding: 40,
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
