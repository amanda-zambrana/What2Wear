import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Alert, Image } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth'; 
import { auth } from '../auth/firebaseconfig';

import { useNavigation, Stack } from 'expo-router'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { appSignOut } from '@/globalUserStorage';
import { AuthStore } from '@/globalUserStorage';
import { useAuthUser } from '@/globalUserStorage';

import * as Location from 'expo-location';

import axios from 'axios';

import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons'; // For chat icon


const openWeatherKey= "e91683ff20c15f34ffd380ab25b9e241"
const geminiApiKey= 'AIzaSyDM-XKatb3fgxTsGRb96WSY19oyQ1oNvWE'


 
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
interface ConversationMessage {
  author: string;
  content: string;
}

export default function Index() {
  const modalizeRef = useRef<Modalize>(null);
  const router = useRouter(); 
  const [Loading,setLoading] = useState(false);



  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true)
  const [outfitSuggestion, setOutfitSuggestion] = useState<string | null>(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  



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



  // useEffect(() => {
  //   if (location) {
  //     console.log("Fetching weather data for location:", location);

  //     fetchWeatherData(location.latitude, location.longitude);
  //   }
  // }, [location]);



  useEffect(() => {
    const requestLocationAndFetchWeather = async () => {
      // Requesting location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsWeatherLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setLocation({ latitude, longitude });
      fetchWeatherData(latitude, longitude);

      const intervalId = setInterval(async () => {
        let loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;
        setLocation({ latitude, longitude });
        fetchWeatherData(latitude, longitude);
      }, 600000); // 10 minutes

      return () => clearInterval(intervalId);
    };

    requestLocationAndFetchWeather();
  }, []);
  

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

  useEffect(() => {
    if (isChatVisible && weatherData) { 
      const temperature = Math.round(weatherData.main.temp);
      const weatherDescription = weatherData.weather[0].description;
      const locationName = weatherData.name || 'your location';

      const weatherInfo = `Current weather in ${locationName} is ${temperature}°F with ${weatherDescription}.`;

      setMessages([
        {
          _id: 1,
          text: `Hello! ${weatherInfo} How can I assist you with your outfit today?`,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'AI Assistant',
          },
        },
      ]);
    }
  }, [isChatVisible, weatherData]);

  const generateMessage = async (conversationMessages: ConversationMessage[]) => {
    const apiKey = 'AIzaSyDM-XKatb3fgxTsGRb96WSY19oyQ1oNvWE'; // Replace with your actual API key
    const modelName = 'models/gemini-1.5-pro';
    const url = `https://generativelanguage.googleapis.com/v1beta2/${modelName}:generateMessage?key=${apiKey}`;
  
    const requestBody = {
      prompt: {
        messages: conversationMessages.map((msg) => ({
          author: msg.author,
          content: msg.content,
        })),
      },
      temperature: 1.0,
      candidateCount: 1,
    };
  
    try {
      const response = await axios.post(url, requestBody);
      const data = response.data;
      const reply = data.candidates[0].content;
      return reply;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };
//   const onSend = useCallback(
//     async (newMessages: IMessage[] = []) => {
//       setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));

//       const userMessage = newMessages[0].text;

//       // Build conversation messages
//       const conversationMessages: ConversationMessage[] = [
//         {
//           author: 'system',
//           content:
//             'You are a fashion expert helping users decide what to wear based on real-time weather conditions, their wardrobe inventory, and personal style preferences.',
//         },
//         ...messages.map((msg) => ({
//           author: msg.user._id === 1 ? 'user' : 'model',
//           content: msg.text,
//         })),
//         {
//           author: 'user',
//           content: userMessage,
//         },
//       ];

//       try {
//         setIsLoadingChat(true);
//         const aiResponse = await generateMessage(conversationMessages);
//         const aiMessage: IMessage = {
//           _id: new Date().getTime(),
//           text: aiResponse,
//           createdAt: new Date(),
//           user: {
//             _id: 2,
//             name: 'AI Assistant',
//           },
//         };
//         setMessages((previousMessages) => GiftedChat.append(previousMessages, [aiMessage]));
//       } catch (error) {
//         console.error('Error fetching AI response:', error);
//         Alert.alert('Error', 'Failed to get response from AI assistant.');
//       } finally {
//         setIsLoadingChat(false);
//       }
//     },
//     [messages]
//   );

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <Text style={styles.headerText}>Hey, {userDisplayName}!</Text>
//           <TouchableOpacity style={styles.chatButton} onPress={() => setIsChatVisible(true)}>
//             <Ionicons name="chatbubble-ellipses-outline" size={30} color="#000" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.menuButton} onPress={onOpen}>
//             <Text style={styles.menuText}>⋮</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Display weather data or loading/error message if couldn't retrieve weather */}
//         {isWeatherLoading ? (
//           <ActivityIndicator size={50} color="#0000ff" />
//         ) : errorMsg ? (
//           <Text style={styles.errorText}>{errorMsg}</Text>
//         ) : (
//           weatherData && <WeatherCard weatherData={weatherData} />
//         )}

//         {/* Loading Overlay */}
//         {Loading && (
//           <Modal transparent={true} animationType="fade" visible={Loading}>
//             <View style={styles.LoadingOverlay}>
//               <ActivityIndicator size={50} color="#ffffff" />
//               <Text style={styles.LoadingText}>Logging out...</Text>
//             </View>
//           </Modal>
//         )}
//       </View>

//       {/* Chat Modal */}
//       <Modal
//         animationType="slide"
//         transparent={false}
//         visible={isChatVisible}
//         onRequestClose={() => setIsChatVisible(false)}
//       >
//         <View style={{ flex: 1 }}>
//           <TouchableOpacity style={styles.closeChatButton} onPress={() => setIsChatVisible(false)}>
//             <Text style={styles.closeChatButtonText}>Close Chat</Text>
//           </TouchableOpacity>
//           <GiftedChat
//             messages={messages}
//             onSend={(messages) => onSend(messages)}
//             user={{ _id: 1 }}
//           />
//           {isLoadingChat && (
//             <View style={styles.LoadingOverlay}>
//               <ActivityIndicator size={50} color="#0000ff" />
//             </View>
//           )}
//         </View>
//       </Modal>
//     </GestureHandlerRootView>
//   );
// }




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
  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));

      const userMessage = newMessages[0].text;

      const conversationMessages: ConversationMessage[] = [
        {
          author: 'system',
          content:
            'You are a fashion expert helping users decide what to wear based on real-time weather conditions, their wardrobe inventory, and personal style preferences.',
        },
        ...messages.map((msg) => ({
          author: msg.user._id === 1 ? 'user' : 'model',
          content: msg.text,
        })),
        {
          author: 'user',
          content: userMessage,
        },
      ];

      try {
        setIsLoadingChat(true);
        const aiResponse = await generateMessage(conversationMessages);
        const aiMessage: IMessage = {
          _id: new Date().getTime(),
          text: aiResponse,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'AI Assistant',
          },
        };
        setMessages((previousMessages) => GiftedChat.append(previousMessages, [aiMessage]));
      } catch (error) {
        console.error('Error fetching AI response:', error);
        Alert.alert('Error', 'Failed to get response from AI assistant.');
      } finally {
        setIsLoadingChat(false);
      }
    },
    [messages]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Hey, {userDisplayName}!</Text>
          <TouchableOpacity style={styles.chatButton} onPress={() => setIsChatVisible(true)}>
            <Ionicons name="chatbubble-ellipses-outline" size={30} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={onOpen}>
            <Text style={styles.menuText}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Display weather data or loading/error message if couldn't retrieve weather */}
        {isWeatherLoading ? (
          <ActivityIndicator size={50} color="#0000ff" />
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
        <Modalize ref={modalizeRef} snapPoint={300} modalHeight={400}>
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

          {/* loading */}
        {Loading && (
          <Modal transparent={true} animationType="fade" visible={Loading}>
            <View style={styles.LoadingOverlay}>
              <ActivityIndicator size={50} color="#ffffff" />
              <Text style={styles.LoadingText}>Logging out...</Text>
            </View>
          </Modal>
        )}
      </View>

      {/* Chat Modal */}
{/* Chat Modal */}
<Modal 
  animationType="slide" 
  transparent={true} 
  visible={isChatVisible}
  onRequestClose={() => setIsChatVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.chatModal}>
      <TouchableOpacity style={styles.closeChatButton} onPress={() => setIsChatVisible(false)}>
        <Text style={styles.closeChatButtonText}>Close Chat</Text>
      </TouchableOpacity>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{ _id: 1 }}
      />
      {isLoadingChat && (
        <View style={styles.LoadingOverlay}>
          <ActivityIndicator size={50} color="#0000ff" />
        </View>
      )}
    </View>
  </View>
</Modal>

    </GestureHandlerRootView>
  );
}
  

  // return (
  //   <GestureHandlerRootView style={{ flex: 1 }}>
  //     <View style={styles.container}>
  //       <View style={styles.header}>
  //         <Text style={styles.headerText}>Hey, {userDisplayName}!</Text>
  //         <TouchableOpacity style={styles.menuButton} onPress={onOpen}>
  //           <Text style={styles.menuText}>⋮</Text>
  //         </TouchableOpacity>
  //       </View>

  //       {/* Button to Navigate to Signup IMP: THIS IS TEMPORARY will change once login and auth works only for debugging purposes!!!!!! */}


  //        {/* Display weather data or loading/error message if counld't retrive weather */}
  //     {isWeatherLoading ? (
  //       <ActivityIndicator size={50} color="#0000ff" />
  //     ) : errorMsg ? (
  //       <Text style={styles.errorText}>{errorMsg}</Text>
  //     ) : (
  //       weatherData && <WeatherCard weatherData={weatherData} />
  //     )}


  //       {/* Modalize Component */}
  //       <Modalize
  //         ref={modalizeRef}
  //         snapPoint={300} // halfway up the screen
  //         modalHeight={400}
  //       >
  //         <View style={styles.menuContent}>
  //           <TouchableOpacity style={styles.menuItem}>
  //             <Text style={styles.menuItemText}>Share Profile</Text>
  //           </TouchableOpacity>
  //           <TouchableOpacity style={styles.menuItem}>
  //             <Text style={styles.menuItemText}>Get Help</Text>
  //           </TouchableOpacity>
  //           <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
  //             <Text style={styles.menuItemText}>Log Out</Text>
  //           </TouchableOpacity>
  //         </View>
  //       </Modalize>

  //       {/* Loading Overlay */}
  //       {Loading && (
  //         <Modal transparent={true} animationType="fade" visible={Loading}>
  //           <View style={styles.LoadingOverlay}>
  //             <ActivityIndicator size={50} color="#ffffff" />
  //             <Text style={styles.LoadingText}>Logging out...</Text>
  //           </View>
  //         </Modal>
  //       )}

  //     </View>
  //   </GestureHandlerRootView>
//   );
// }

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
    bottom: '5%', 
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
    backgroundColor: '#a0d9f7', 
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
  chatButton: {
    position: 'absolute',
    right: 60, 
    top: 60,
  },
  closeChatButton: {
    padding: 10,
    backgroundColor: '#3dc8ff',
    alignItems: 'center',
  },
  closeChatButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end', // Position the modal at the bottom
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim the background
  },
  chatModal: {
    width: '100%',
    height: '75%', 
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 20,
    marginBottom: 83,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});