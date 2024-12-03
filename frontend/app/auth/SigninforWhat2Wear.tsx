import React, { useState, useEffect, useRef } from 'react'; //useref is used for animations for future referece
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  SafeAreaView, 
  Animated, 
  Keyboard, 
  Platform,  //to give info about which platform user is using either IOS or andorid
  KeyboardEvent,  //need this as event does not work without this IMP
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert 
} from 'react-native';
import LottieView from 'lottie-react-native';  // Import LottieView package for animation
import { Link, useNavigation, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseconfig';
import { Tabs } from 'expo-router';
import { appSignIn } from '@/globalUserStorage';
import { useAuthUser } from '@/globalUserStorage';


const LoginPage = () => { //right now login page does nothing need to add some authentication to check working
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
const router = useRouter();
  const shiftValue = useRef(new Animated.Value(0)).current; //creates an initial reference for an animated value that we will use to animate the keyboard for our device

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardShow); //when keyboard appears
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardHide); //when keyboard disappears

    return () => {
      keyboardDidHideListener.remove(); //destructors to remove the above listerners. IMP as it prevents memory leaks
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleKeyboardShow = (event: KeyboardEvent) => { //handles appearence of keybaord by animating upward shift of the content based on keyboard's heiht so that the keyboard does not block the user's content when typing in
    Animated.timing(shiftValue, { 
      toValue: -event.endCoordinates.height / 2,  //shifting the keyboard upward by half of keyboard height
      duration: 300,  //time taking for achieving the animation
      useNativeDriver: true, //using native IOS or andrioid driver. NO idea how it works just saw it online
    }).start(); //start animation
  };

  const handleKeyboardHide = () => { //animate the keyboard dissappears therefore making the screen back to its original screen scpace
    Animated.timing(shiftValue, {
      toValue: 0,
      duration: 300, 
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async (): Promise<void> => {  //IMP for handling login logic. THis will interface with the backend currently oinly has console.log
    //console.log('Logging in with:', email, password);

    if (!email || !password)
    {
      Alert.alert('Please enter both email and password ');
      return ;
    }
    setLoading(true);
    try{
      //const usercred=await signInWithEmailAndPassword(auth,email,password);
      //const user = usercred.user;
      //Alert.alert( "Success", "Logged In Successfully")
      //console.log("User logged in",user);

      //router.push('/(tabs)');



      const result = await appSignIn(email, password);
      if (result.error) {
        // Cast result.error as any to allow TypeScript to recognize the 'code' property
        const error = result.error as { code: string; message?: string };
        let errorMessage;
        switch (error.code) {
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No user found with this email. Please try again.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is not valid. Please check the format.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          default:
            errorMessage = 'An unknown error occurred. Please try again later.';
        }
        Alert.alert("Error",errorMessage);
    }
    else 
    {
      Alert.alert("Success", "Logged In Successfully");
      console.log("User logged in", result.user); // Confirm session persistence
      router.push('/(tabs)');
    }
  }
    catch (error:any)
    {
      // let errorMessage= error.message;

      // switch(error.code)
      // {
      //   case 'auth/wrong-password':
      //     errorMessage = 'Incorrect password. Please try again.';
      //     break;
        
      //     case 'auth/user-not-found':
      //       errorMessage = 'No user found with this email. Please try again.';
      //       break;
      //     case 'auth/invalid-email':
      //       errorMessage = 'The email address is not valid. Please check the format.';
      //       break;
      //     case 'auth/too-many-requests':
      //       errorMessage = 'Too many failed attempts. Please try again later.';
      //       break;
      //     default:
      //       errorMessage = 'An unknown error occurred. Please try again later.';
    
      console.error("Login error:", error);
      Alert.alert("Error", "An unexpected error occurred.");


      

      //Alert.alert('Error', errorMessage)
    }
  
      finally
    {
      setLoading(false)
    }

  };

  return (
    // dismiss keyboard when user touches outside the input fields
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {/* // safe area to ensure content doesnt overlap with other text or keyboard  */}
      <SafeAreaView style={styles.container}>
        {/* To shift content up when the keyboard appears */}
        <Animated.View style={[styles.animatedContainer, { transform: [{ translateY: shiftValue }] }]}>
          {/* This contains picture of a wardrobe taken from assets. Can be changed if it doesnt fall under best practicies */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../assets/images/Closet.jpg')}  // takes picture from assets
              style={styles.backgroundImage}
            />

            {/* Lottie Animation placed on top of the image */}
            <LottieView
                         // This contains our animation that is being taken from assets. Can be changed if it doesn't follow best practices
          source={require('../../assets/animations/clothing.json')} // Your Lottie JSON file
          autoPlay
         loop
          style={styles.lottieAnimation}
/>
          </View>

          {/* Main title and description right now its plain but we can change the font styles and stuff and make it more appealing */}
          <Text style={styles.title}>Wardrobe that knows what's best for YOU</Text>
          <Text style={styles.description}>
            Welcome to What2Wear, your fashion wardrobe plus your stylized guide.
          </Text>

          {/* Email Input values */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#94adc7"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input Values */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94adc7"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button right now its empty but will update once values are set and we can login to the main screen */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Using this to navigate to other areas of app. Can go to signup page from new to what2wear  */}
          <View style={styles.linkContainer}>
            <TouchableOpacity>
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Link href="/auth/SignupforWhat2Wear">
              
              <Text style={styles.linkText}>New to What2Wear? Sign up</Text>
              </Link>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121a21',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedContainer: {
    width: '100%',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 200,  // Usef for Reducing height of the background image
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',  // Position relative for absolute positioning of the Lottie animation
  },
  backgroundImage: {
    width: '100%',  // Slightly reduce the width for a centralized look
    height: '100%',
    resizeMode: 'contain',  // Adjust image to fit nicely within the container
  },
  lottieAnimation: {
    position: 'absolute',  // Position Lottie animation on top of the image
    width: 150,  // Resize animation to fit better
    height: 150,
    left: '4%',  // Move animation to the left
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  description: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  inputContainer: {
    width: '90%',
    backgroundColor: '#1a2632',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
    borderColor: '#354d64',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#ffffff',
  },
  showPasswordButton: {
    padding: 10,
  },
  showPasswordText: {
    color: '#94adc7',
  },
  loginButton: {
    backgroundColor: '#3dc8ff',  
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginVertical: 20,
  },
  buttonText: {
    color: '#ffffff',  
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginVertical: 10,
  },
  linkText: {
    color: '#94adc7',  
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginPage;