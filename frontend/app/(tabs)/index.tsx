import React, { useRef, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth'; 
import { auth } from '../auth/firebaseconfig';

import { useNavigation, Stack } from 'expo-router'; // Import useNavigation from expo-router
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Defining the type for the navigation prop based on  routes
type RootStackParamList = {
  index: undefined;
  style: undefined; 
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'index'>;


export default function Index() {
  const modalizeRef = useRef<Modalize>(null);
  const router = useRouter(); 
  const [Loading,setLoading] = useState(false);

  const onOpen = () => {
    modalizeRef.current?.open();
  };


  const navigateToSignup = () => {
    router.push('../auth/SigninforWhat2Wear'); // Navigate to the signup screen
  };


  const handleLogout = async (): Promise<void> => {
    setLoading(true);
    

    try{ 

      await signOut(auth);
      router.push('../auth/SigninforWhat2Wear');

    }
    catch(error)
    {
      console.error('Encounterd unexpected error. Please try again');
    }
    finally 
    {
      setLoading(false);
    }

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
          <Text style={styles.headerText}>Hey, User!</Text>
          <TouchableOpacity style={styles.menuButton} onPress={onOpen}>
            <Text style={styles.menuText}>⋮</Text>
          </TouchableOpacity>
        </View>


        {/* Button to Navigate to Signup IMP: THIS IS TEMPORARY will change once login and auth works only for debugging purposes!!!!!! */}
        <TouchableOpacity style={styles.signupButton} onPress={navigateToSignup}>
          <Text style={styles.signupButtonText}>Go to Sign Up</Text>
        </TouchableOpacity>


        {/* Centered Section */}
        <View style={styles.centeredSection}>
          <Text style={styles.planText}>Plan your outfit for today:</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleCreateNewOutfit}>
            <Text style={styles.actionButtonText}>Create a New Outfit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Choose from Outfits</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Choose from Style Boards</Text>
          </TouchableOpacity>
        </View>

        {/* Modalize Component */}

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
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuItemText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Modalize>



        {/* Loading Overlay */}
        {Loading && (
          <Modal transparent={true} animationType="fade" visible={Loading}>
            <View style={styles.LoadingOverlay}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.LoadingText}>Logging out...</Text>
            </View>
          </Modal>
        )}


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

  centeredSection: {
    position: 'absolute',
    bottom: '10%', 
    alignItems: 'center',
    width: '100%',
  },
  planText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  actionButton: {
    backgroundColor: '#3dc8ff',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#fff',

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

  LoadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
  },
  LoadingText: {
    color: '#ffffff',
    marginTop: 20,
    fontSize: 18,
  },
});
