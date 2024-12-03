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

import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { HfInference } from '@huggingface/inference';


const openWeatherKey= "e91683ff20c15f34ffd380ab25b9e241"
const geminiApiKey= 'AIzaSyDxWzu2JL4EIzW0QA6LvgUKhJKu0rI7-8A'


 
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
// interface ConversationMessage {
//   author: string;
//   content: string;
// }
interface ConversationMessage {
  author: 'system' | 'user' | 'assistant';
  content: string;
}

// interface HuggingFaceChatCompletionResponse {
//   generated_text?: string;
//   text?: string;
//   [key: string]: any; // Allows for additional properties
// }

interface HuggingFaceChatCompletionResponse {
  generated_text?: string;
  text?: string;
  [key: string]: any; // Allows for additional properties
}

interface HuggingFaceErrorResponse {
  error: string;
}

type HuggingFaceResponse = HuggingFaceChatCompletionResponse[] | HuggingFaceErrorResponse;

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
  
  const hf = new HfInference("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");


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

  // const generateMessage = async (conversationMessages: ConversationMessage[]) => {
  //   const apiKey = 'AIzaSyDxWzu2JL4EIzW0QA6LvgUKhJKu0rI7-8A   '; // Replace with your actual API key
  //   const modelName = 'models/gemini-1.5-Pro';
  //   const url = `https://generativelanguage.googleapis.com/v1beta2/${modelName}:generateMessage?key=${apiKey}`;

  
  //   const requestBody = {
  //     prompt: {
  //       messages: conversationMessages.map((msg) => ({
  //         author: msg.author,
  //         content: msg.content,
  //       })),
  //     },
  //     temperature: 1.0,
  //     candidateCount: 1,
  //   };
  
  //   try {
  //     console.log("Sending request to AI API with body:", JSON.stringify(requestBody, null, 2));

  //     const response = await axios.post(url, requestBody);
  //     const data = response.data;
  //     console.log("AI API Response:", data); 

      
  //     const reply = data.candidates[0].content;
  //     return reply;
  //   } catch (error:any) {
  //     console.error('API call error:', error.response?.data || error.message);
  //     throw error;
  //   }
  // };
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

//         {/* Centered Section */}
//         <View style={styles.centeredSection}>
//           <Text style={styles.planText}>Plan your outfit for today:</Text>

//           <TouchableOpacity style={styles.actionButton} onPress={handleCreateNewOutfit}>
//             <Text style={styles.actionButtonText}>Create a New Outfit</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.actionButton}>
//             <Text style={styles.actionButtonText}>Choose from Outfits</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.actionButton}>
//             <Text style={styles.actionButtonText}>Choose from Style Boards</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Modalize Component */}
//         <Modalize ref={modalizeRef} snapPoint={300} modalHeight={400}>
//           <View style={styles.menuContent}>
//             <TouchableOpacity style={styles.menuItem}>
//               <Text style={styles.menuItemText}>Share Profile</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.menuItem}>
//               <Text style={styles.menuItemText}>Get Help</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
//               <Text style={styles.menuItemText}>Log Out</Text>
//             </TouchableOpacity>
//           </View>
//         </Modalize>

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


// 


// const generateMessage = async (conversationMessages: ConversationMessage[]): Promise<string> => {
//   try {
//     // Use a Chat Completion compatible model from Hugging Face
//     const model = 'gpt2'; // Replace with your desired model

//     // Prepare messages in the format expected by the model
//     const messages = conversationMessages.map((msg) => ({
//       role: msg.author,
//       content: msg.content,
//     }));

//     // Use Hugging Face's chatCompletion method
//     const response = await hf.chatCompletion({
//       model: model,
//       messages: messages,
//       max_tokens: 3800, // Adjust as needed
//       temperature: 0.7, // Adjust as needed
//     });

//     return response.generated_text || 'Sorry, I could not generate a response.';
//   } catch (error: any) {
//     console.error('Hugging Face API error:', error);
//     throw new Error('Failed to fetch AI response');
//   }
// };





  // const WeatherCard = ({ weatherData }: { weatherData: WeatherData | null }) => {
  //   if (!weatherData) return null;

  //   const temperature = Math.round(weatherData.main.temp);
  //   const weatherDescription = weatherData.weather[0].description;
  //   const iconCode = weatherData.weather[0].icon;
  //   const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  //   const date = new Date().toLocaleDateString('en-US', {
  //     weekday: 'long',
  //     month: 'long',
  //     day: 'numeric',
  //   });

  //   const locationName = weatherData.name || 'Your Location';

  //   return (
  //     <View style={styles.weatherContainer}>
  //       <View style={styles.weatherCard}>
  //         <Text style={styles.temperature}>{temperature}°F</Text>
  //         <Text style={styles.dateText}>{date}</Text>
  //         <Text style={styles.locationText}>{locationName}</Text>
  //         <Image source={{ uri: iconUrl }} style={styles.weatherIcon} />
  //         <Text style={styles.weatherDescription}>{weatherDescription}</Text>
  //       </View>
  //     </View>
  //   );
  // };






















//   const onSend = useCallback(
//     async (newMessages: IMessage[] = []) => {
//       setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));

//       Keyboard.dismiss();

//       const userMessage = newMessages[0].text;
//       console.log("User message:", userMessage);
//       const conversationMessages: ConversationMessage[] = [
//         {
//           author: 'system',
//           content:
//             'You are a fashion expert helping users decide what to wear based on real-time weather conditions, their wardrobe inventory, and personal style preferences.',
//         },
//         ...messages.map((msg) => ({
//           author: msg.user._id === 1 ? 'user' : 'assistant',
//           content: msg.text,
//         })),
//         {
//           author: 'user',
//           content: userMessage,
//         },
//       ];

//       try {
//         setIsLoadingChat(true);
//         console.log("Sending conversation messages to AI API:", conversationMessages);

//         const aiResponse = await generateMessage(conversationMessages);
//         console.log("AI Response received:", aiResponse);

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

//         {/* Centered Section */}
//         <View style={styles.centeredSection}>
//           <Text style={styles.planText}>Plan your outfit for today:</Text>

//           <TouchableOpacity style={styles.actionButton} onPress={handleCreateNewOutfit}>
//             <Text style={styles.actionButtonText}>Create a New Outfit</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.actionButton}>
//             <Text style={styles.actionButtonText}>Choose from Outfits</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.actionButton}>
//             <Text style={styles.actionButtonText}>Choose from Style Boards</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Modalize Component */}
//         <Modalize ref={modalizeRef} snapPoint={300} modalHeight={400}>
//           <View style={styles.menuContent}>
//             <TouchableOpacity style={styles.menuItem}>
//               <Text style={styles.menuItemText}>Share Profile</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.menuItem}>
//               <Text style={styles.menuItemText}>Get Help</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
//               <Text style={styles.menuItemText}>Log Out</Text>
//             </TouchableOpacity>
//           </View>
//         </Modalize>

//           {/* loading */}
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
//   animationType="slide"
//   transparent={false}
//   visible={isChatVisible}
//   onRequestClose={() => setIsChatVisible(false)} // For Android back button
// >
//   <KeyboardAvoidingView
//     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//     style={{ flex: 1 }}
//   >
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//       <View style={{ flex: 1 }}>
//         {/* Back to Index Button */}
//         <View style={{ padding: 9, backgroundColor: '#3dc8ff', flexDirection: 'row', alignItems: 'center', marginTop:30, }}>
//         <TouchableOpacity
//           style={styles.closeChatButton}
//           onPress={() => setIsChatVisible(false)} // Toggle chat visibility
//         >   
//           {/* <Ionicons name = "arrow-back-outline" size= {34} color= "#fff" /> */}
//           <Text style={styles.closeChatButtonText}>Back</Text>
//         </TouchableOpacity>
//         </View>

//         {/* GiftedChat Component */}
//         <GiftedChat
//           messages={messages}
//           onSend={(newMessages) => onSend(newMessages)}
//           user={{ _id: 1 }}
//         />

//         {/* Chat Loading Indicator */}
//         {isLoadingChat && (
//           <View style={styles.LoadingOverlay}>
//             <ActivityIndicator size={50} color="#0000ff" />
//           </View>
//         )}
//       </View>
//     </TouchableWithoutFeedback>
//   </KeyboardAvoidingView>
// </Modal>
//     </GestureHandlerRootView>
//   );
// }
  

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




  //       {/* Centered Section */}
  //       <View style={styles.centeredSection}>
  //         <Text style={styles.planText}>Plan your outfit for today:</Text>
          
  //         <TouchableOpacity style={styles.actionButton} onPress={handleCreateNewOutfit}>
  //           <Text style={styles.actionButtonText}>Create a New Outfit</Text>
  //         </TouchableOpacity>
  //         <TouchableOpacity style={styles.actionButton}>
  //           <Text style={styles.actionButtonText}>Choose from Outfits</Text>
  //         </TouchableOpacity>
  //         <TouchableOpacity style={styles.actionButton}>
  //           <Text style={styles.actionButtonText}>Choose from Style Boards</Text>
  //         </TouchableOpacity>
  //       </View>

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



const generateMessage = async (conversationMessages: ConversationMessage[]): Promise<string> => {
  try {
    // Define the system prompt with explicit instructions
    const systemPrompt = `
You are a fashion expert helping users decide what to wear based on real-time weather conditions, their wardrobe inventory, and personal style preferences. The current weather in Guilford is 37°F with overcast clouds.

Please do not repeat or include this prompt in your responses.

---

User: Hello
Assistant:
    `;

    const MAX_HISTORY = 2;
    const limitedConversationMessages = conversationMessages.slice(-MAX_HISTORY);

    // Construct user and assistant messages
    const userAssistantPrompt = limitedConversationMessages
      .map(msg => {
        if (msg.author === 'user') return `User: ${msg.content}`;
        if (msg.author === 'assistant') return `Assistant: ${msg.content}`;
        return '';
      })
      .join('\n');

    // Append 'Assistant:' to prompt the model to generate the assistant's response
    const prompt = `${systemPrompt}\n${userAssistantPrompt}\nAssistant:`;

    console.log('Constructed Prompt:', prompt); // For debugging

    // Make a POST request to the Hugging Face text-generation API
    const response = await fetch(`https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${"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"}`, // Use environment variable
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 150, // Adjust as needed
          temperature: 0.6,    // Adjust as needed
          top_p: 0.9,
          do_sample: true,
          stop: ["User:", "Assistant:"],
          echo: false,          // Prevent echoing the prompt
        },
      }),
    });

    const data = await response.json();
    console.log('Hugging Face API Full Response:', data); // For debugging

    // Check for errors in the response
    if (data.error) {
      throw new Error(data.error);
    }

    // Extract the generated text from the first element of the array
    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      const fullResponse = data[0].generated_text.trim();

      // Find the index of 'Assistant:' and extract the response after it
      const assistantIndex = fullResponse.lastIndexOf('Assistant:');
      if (assistantIndex !== -1) {
        const extractedResponse = fullResponse.substring(assistantIndex + 'Assistant:'.length).trim();
        return extractedResponse;
      } else {
        // Fallback if 'Assistant:' not found
        return fullResponse;
      }
    } else {
      return 'Sorry, I could not generate a response.';
    }
  } catch (error: any) {
    console.error('Hugging Face API Error:', error);
    throw new Error('Failed to fetch AI response');
  }
};



// Function to handle sending messages
const onSend = useCallback(
  async (newMessages: IMessage[] = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));

    Keyboard.dismiss();

    const userMessage = newMessages[0].text;
    console.log('User message:', userMessage);

    // Construct conversation messages excluding the system message
    const conversationMessages: ConversationMessage[] = [
      ...messages.map((msg): ConversationMessage => ({
        author: msg.user._id === 1 ? 'user' : 'assistant',
        content: msg.text,
      })),
      {
        author: 'user',
        content: userMessage,
      },
    ];

    try {
      setIsLoadingChat(true);
      console.log('Sending conversation messages to Hugging Face API:', conversationMessages);

      const aiResponse = await generateMessage(conversationMessages);
      console.log('AI Response received:', aiResponse);

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
  [messages, weatherData]
);



// WeatherCard component to display weather information
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Hey, {userDisplayName}!</Text>
        <TouchableOpacity style={styles.chatButton} onPress={() => setIsChatVisible(true)}>
          <Ionicons name="chatbubble-ellipses-outline" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={onOpen}>
          <Text style={styles.menuText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Weather Information */}
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

      {/* Loading Overlay */}
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
    <Modal
      animationType="slide"
      transparent={false}
      visible={isChatVisible}
      onRequestClose={() => setIsChatVisible(false)} // For Android back button
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Back to Index Button */}
            <View
              style={{
                padding: 9,
                backgroundColor: '#3dc8ff',
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 30,
              }}
            >
              <TouchableOpacity
                style={styles.closeChatButton}
                onPress={() => setIsChatVisible(false)} // Toggle chat visibility
              >
                <Text style={styles.closeChatButtonText}>Back</Text>
              </TouchableOpacity>
            </View>

            {/* GiftedChat Component */}
            <GiftedChat
              messages={messages}
              onSend={(newMessages) => onSend(newMessages)}
              user={{ _id: 1 }}
            />

            {/* Chat Loading Indicator */}
            {isLoadingChat && (
              <View style={styles.LoadingOverlay}>
                <ActivityIndicator size={50} color="#0000ff" />
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  </GestureHandlerRootView>
);
}




// const cleanAIResponse = (fullResponse: string): string => {
//   // Remove system prompt using regex
//   const systemPromptRegex = /You are a fashion expert.*?Please do not repeat or include any part of this prompt in your responses\./s;
//   let response = fullResponse.replace(systemPromptRegex, '').trim();

//   // Remove any 'User:' or 'Assistant:' labels that might have been echoed
//   response = response.replace(/User:.*?\nAssistant:/s, '').trim();

//   // Extract text after the last 'Assistant:'
//   const assistantIndex = response.lastIndexOf('Assistant:');
//   if (assistantIndex !== -1) {
//     response = response.substring(assistantIndex + 'Assistant:'.length).trim();
//   }

//   return response;
// };

// // Helper function to construct the prompt
// const constructPrompt = (conversationMessages: ConversationMessage[]) => {
//   const systemPrompt = `
// You are a fashion expert assisting users in selecting outfits based on real-time weather, wardrobe inventory, and personal style preferences.

// **Important:** Do not repeat or include any part of this prompt in your responses. Your reply should solely address the user's query.
// `;


//   const MAX_HISTORY = 4; // Increase history to last 4 interactions (2 user and 2 assistant messages)
//   const limitedConversation = conversationMessages.slice(-MAX_HISTORY);
  
//   const conversationText = limitedConversation.map(msg => {
//     if (msg.author === 'user') return `User: ${msg.content}`;
//     if (msg.author === 'assistant') return `Assistant: ${msg.content}`;
//     return '';
//   }).join('\n');

//   const fullPrompt = `${systemPrompt}\n\n${conversationText}\nAssistant:`;

//   return fullPrompt;
// };


// // Function to generate AI message using Hugging Face API
// const generateMessage = async (conversationMessages: ConversationMessage[]): Promise<string> => {
//   try {
//     const fullPrompt = constructPrompt(conversationMessages);
//     if (process.env.DEBUG === 'true') {
//       console.log('Constructed Prompt:', fullPrompt); // For debugging
//     }

//     const response = await fetch(`https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${"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"}`, // Securely fetched from environment
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         inputs: fullPrompt,
//         parameters: {
//           max_new_tokens: 150,
//           temperature: 0.7,
//           top_p: 0.9,
//           do_sample: true,
//           stop: ["User:", "Assistant:"],
//           echo: false,
//         },
//       }),
//     });

//     const data: HuggingFaceResponse = await response.json();

//     if (process.env.DEBUG === 'true') {
//       // Sanitize sensitive data before logging
//       if (Array.isArray(data)) {
//         console.log('Hugging Face API Full Response:', { ...data, generated_text: '***REDACTED***' });
//       } else {
//         console.log('Hugging Face API Error Response:', { ...data, error: '***REDACTED***' });
//       }
//     }

//     // Check if the response is an error
//     if (!Array.isArray(data) && 'error' in data) {
//       throw new Error(data.error);
//     }

//     // Process the successful response
//     if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
//       const fullResponse = data[0].generated_text.trim();

//       const cleanedResponse = cleanAIResponse(fullResponse);
//       return cleanedResponse || 'Sorry, I could not generate a response.';
//     } else {
//       return 'Sorry, I could not generate a response.';
//     }
//   } catch (error: any) {
//     console.error('Hugging Face API Error:', error);
//     throw new Error('Failed to fetch AI response');
//   }
// };

// const onSend = useCallback(
//   async (newMessages: IMessage[] = []) => {
//     setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));

//     Keyboard.dismiss();

//     const userMessage = newMessages[0].text;
//     if (process.env.DEBUG === 'true') {
//       console.log('User message:', userMessage);
//     }

//     // Construct conversation messages excluding the system message
//     const conversationMessages: ConversationMessage[] = [
//   ...messages.map((msg): ConversationMessage => ({
//     author: msg.user._id === 1 ? 'user' : 'assistant',
//     content: msg.text,
//   })),
//   {
//     author: 'user',
//     content: userMessage,
//   },
// ];

//     try {
//       setIsLoadingChat(true);
//       if (process.env.DEBUG === 'true') {
//         console.log('Sending conversation messages to Hugging Face API:', conversationMessages);
//       }

//       const aiResponse = await generateMessage(conversationMessages);
//       if (process.env.DEBUG === 'true') {
//         console.log('AI Response received:', aiResponse);
//       }

//       const aiMessage: IMessage = {
//         _id: new Date().getTime(),
//         text: aiResponse,
//         createdAt: new Date(),
//         user: {
//           _id: 2,
//           name: 'AI Assistant',
//         },
//       };
//       setMessages((previousMessages) => GiftedChat.append(previousMessages, [aiMessage]));
//     } catch (error) {
//       console.error('Error fetching AI response:', error);
//       Alert.alert('Error', 'Failed to get response from AI assistant.');
//     } finally {
//       setIsLoadingChat(false);
//     }
//   },
//   [messages]
// );



// // WeatherCard component to display weather information
// const WeatherCard = ({ weatherData }: { weatherData: WeatherData | null }) => {
//   if (!weatherData) return null;

//   const temperature = Math.round(weatherData.main.temp);
//   const weatherDescription = weatherData.weather[0].description;
//   const iconCode = weatherData.weather[0].icon;
//   const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

//   const date = new Date().toLocaleDateString('en-US', {
//     weekday: 'long',
//     month: 'long',
//     day: 'numeric',
//   });

//   const locationName = weatherData.name || 'Your Location';

//   return (
//     <View style={styles.weatherContainer}>
//       <View style={styles.weatherCard}>
//         <Text style={styles.temperature}>{temperature}°F</Text>
//         <Text style={styles.dateText}>{date}</Text>
//         <Text style={styles.locationText}>{locationName}</Text>
//         <Image source={{ uri: iconUrl }} style={styles.weatherIcon} />
//         <Text style={styles.weatherDescription}>{weatherDescription}</Text>
//       </View>
//     </View>
//   );
// };

// return (
//   <GestureHandlerRootView style={{ flex: 1 }}>
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerText}>Hey, {userDisplayName}!</Text>
//         <TouchableOpacity style={styles.chatButton} onPress={() => setIsChatVisible(true)}>
//           <Ionicons name="chatbubble-ellipses-outline" size={30} color="#000" />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.menuButton} onPress={onOpen}>
//           <Text style={styles.menuText}>⋮</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Weather Information */}
//       {isWeatherLoading ? (
//         <ActivityIndicator size={50} color="#0000ff" />
//       ) : errorMsg ? (
//         <Text style={styles.errorText}>{errorMsg}</Text>
//       ) : (
//         weatherData && <WeatherCard weatherData={weatherData} />
//       )}

//       {/* Centered Section */}
//       <View style={styles.centeredSection}>
//         <Text style={styles.planText}>Plan your outfit for today:</Text>

//         <TouchableOpacity style={styles.actionButton} onPress={handleCreateNewOutfit}>
//           <Text style={styles.actionButtonText}>Create a New Outfit</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.actionButton}>
//           <Text style={styles.actionButtonText}>Choose from Outfits</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.actionButton}>
//           <Text style={styles.actionButtonText}>Choose from Style Boards</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Modalize Component */}
//       <Modalize ref={modalizeRef} snapPoint={300} modalHeight={400}>
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

//     {/* Chat Modal */}
//     <Modal
//       animationType="slide"
//       transparent={false}
//       visible={isChatVisible}
//       onRequestClose={() => setIsChatVisible(false)} // For Android back button
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={{ flex: 1 }}
//       >
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//           <View style={{ flex: 1 }}>
//             {/* Back to Index Button */}
//             <View
//               style={{
//                 padding: 9,
//                 backgroundColor: '#3dc8ff',
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 marginTop: 30,
//               }}
//             >
//               <TouchableOpacity
//                 style={styles.closeChatButton}
//                 onPress={() => setIsChatVisible(false)} // Toggle chat visibility
//               >
//                 <Text style={styles.closeChatButtonText}>Back</Text>
//               </TouchableOpacity>
//             </View>

//             {/* GiftedChat Component */}
//             <GiftedChat
//               messages={messages}
//               onSend={(newMessages) => onSend(newMessages)}
//               user={{ _id: 1 }}
//             />

//             {/* Chat Loading Indicator */}
//             {isLoadingChat && (
//               <View style={styles.LoadingOverlay}>
//                 <ActivityIndicator size={50} color="#0000ff" />
//               </View>
//             )}
//           </View>
//         </TouchableWithoutFeedback>
//       </KeyboardAvoidingView>
//     </Modal>
//   </GestureHandlerRootView>
// );
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
    marginTop:10,
  },
  closeChatButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});