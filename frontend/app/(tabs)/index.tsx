import React, { useRef, useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Alert, Image } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth'; 
import { auth } from '../auth/firebaseconfig';

import { useNavigation, Stack } from 'expo-router'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { appSignOut } from '@/globalUserStorage';
import { AuthStore } from '@/globalUserStorage';
import { useAuthUser } from '@/globalUserStorage';

import * as Location from 'expo-location';

const openWeatherKey= "e91683ff20c15f34ffd380ab25b9e241"


 
// Defining the type for the navigation prop based on  routes
type RootStackParamList = {
  index: undefined;
  style: undefined; 
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'index'>;

type LocationCoords = {
  latitude: number;
  longitude: number;
};

type WeatherData = {
  main: {
    temp: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  name: string;
};

export default function Index() {
  const modalizeRef = useRef<Modalize>(null);
  const router = useRouter(); 
  const [Loading,setLoading] = useState(false);



  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true)
  



  //const userDisplayName = AuthStore.useState((state) => state.userDisplayName);
  const user = useAuthUser();
  const userDisplayName = user?.displayName || 'User';

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  const navigateToSignup = () => {
    router.push('../auth/SigninforWhat2Wear'); // Navigate to the signup screen
  };

  const handleLogout = async (): Promise<void> => {
    setLoading(true);
  
    try{ 
     // await signOut(auth);
     // router.push('../auth/SigninforWhat2Wear');
     const result = await appSignOut();
     if (result.error) {
      throw result.error; // Handle error if logout fails
    }
      Alert.alert("Success", "Logged Out Successfully");
    router.push('../auth/SigninforWhat2Wear');

  }
    catch(error)
    {
      console.error('Encounterd unexpected error. Please try again');
      Alert.alert("Error", "An unexpected error occurred during logout.");

    }
    finally 
    {
      setLoading(false);
    }
  };

  // Create a navigation reference for buttons to navigate to diff tabs 
  const navigation = useNavigation<NavigationProp>(); // Use the defined navigation prop type

  // Function to handle navigation to the "Style" tab to create a new outfit 
  const handleCreateNewOutfit = () => {
    navigation.navigate('style'); 

  };




  // useEffect(() => {
  //   (async () => {
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       console.log("Location permission denied")   
  //       setErrorMsg('Permission to access location was denied');
  //       setIsWeatherLoading(false);
  //       return;
  //     }

  //     console.log("Location permission granted");
  //     let loc = await Location.getCurrentPositionAsync({});
  //     console.log("Location retrieved:", loc);

  //     setLocation({
  //       latitude: loc.coords.latitude,
  //       longitude: loc.coords.longitude,
  //     });
  //   })();
  // }, []);


  // useEffect(() => {
  //   const intervalId = setInterval(async () => {
  //     let loc = await Location.getCurrentPositionAsync({});
  //     setLocation({
  //       latitude: loc.coords.latitude,
  //       longitude: loc.coords.longitude,
  //     });
  //   }, 600000); // 5 minutes (300,000 ms)

  //   return () => clearInterval(intervalId); // Clear the interval on component unmount
  // }, []);



  // // NEW: Fetch weather data when location is available
  // useEffect(() => {
  //   if (location) {
  //     console.log("Fetching weather data for location:", location);

  //     fetchWeatherData(location.latitude, location.longitude);
  //   }
  // }, [location]);



  useEffect(() => {
    const requestLocationAndFetchWeather = async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsWeatherLoading(false);
        return;
      }

      // Perform initial fetch
      let loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setLocation({ latitude, longitude });
      fetchWeatherData(latitude, longitude);

      // Set up periodic fetch every 10 minutes
      const intervalId = setInterval(async () => {
        let loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;
        setLocation({ latitude, longitude });
        fetchWeatherData(latitude, longitude);
      }, 600000); // 10 minutes

      // Clear interval on component unmount
      return () => clearInterval(intervalId);
    };

    requestLocationAndFetchWeather();
  }, []);
  

  // NEW: Fetch weather data from OpenWeatherMap
  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      setIsWeatherLoading(true);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${openWeatherKey}`
      );
      const data = await response.json();

      if(data && data.main)
      {
      setWeatherData(data);
      }
      else
      {
        console.log("Unexpected response format:", data);
      setErrorMsg("Failed to retrieve weather data.");
      }

    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to fetch weather data');
    } finally {
      setIsWeatherLoading(false);
    }
  };


  const WeatherCard = ({ weatherData }: { weatherData: WeatherData | null }) => {
    if (!weatherData) return null;

    const temperature = Math.round(weatherData.main.temp);
    const weatherDescription = weatherData.weather[0].description;
    const iconCode = weatherData.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const locationName = weatherData.name || 'Your Location';

    return (
      <View style={styles.weatherContainer}>
        <View style={styles.weatherCard}>
          <Text style={styles.temperature}>{temperature}°F</Text>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.locationText}>{locationName}</Text>
          <Image source={{ uri: iconUrl }} style={styles.weatherIcon} />
          <Text style={styles.weatherDescription}>{weatherDescription}</Text>
        </View>
      </View>
    );
  };

  

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Hey, {userDisplayName}!</Text>
          <TouchableOpacity style={styles.menuButton} onPress={onOpen}>
            <Text style={styles.menuText}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Button to Navigate to Signup IMP: THIS IS TEMPORARY will change once login and auth works only for debugging purposes!!!!!! */}


         {/* Display weather data or loading/error message */}
      {isWeatherLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        weatherData && <WeatherCard weatherData={weatherData} />
      )}




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
  },
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
  weatherCard: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#a0d9f7', // Use color matching the prototype
    borderRadius: 15,
    width: '100%',
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  temperature: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#000',
  },
  weatherIcon: {
    width: 80,
    height: 80,
    marginVertical: 10,
  },
  weatherDescription: {
    fontSize: 18,
    color: '#000',
    textTransform: 'capitalize',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
});