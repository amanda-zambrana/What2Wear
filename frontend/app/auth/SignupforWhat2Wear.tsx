import React, { useState, useEffect, useRef } from 'react';
import { 
  View, // for holding layout
  Text, // for displaying text
  TextInput, //for displaying user input
  TouchableOpacity, //touchable button self explanitory
  StyleSheet, //custom style
  SafeAreaView, //for adapting multiple devices as it provides safe areas
  ScrollView, // scrollable 
  Animated, //animate components
  Keyboard, // handle keyboard events
  KeyboardEvent, // Need this as event is giving an error
  TouchableWithoutFeedback, // to dismiss keyboard when user taps anywhere else on screen
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Link } from 'expo-router';

const SignUpPage: React.FC = () => { 
  const [username, setUsername] = useState(''); //hpld userna,e
  const [email, setEmail] = useState(''); //hold password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); //confirm password
  const [showPassword, setShowPassword] = useState(false); //toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // const shiftValue = useRef(new Animated.Value(0)).current; //to assign an animated value for keyboard showing up 

  // useEffect(() => {
  //   const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardShow); //to detect when keyboard appears
  //   const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardHide); //to detect when keyboard disappears

  //   return () => {
  //     keyboardDidHideListener.remove(); //destructer to remove listener
  //     keyboardDidShowListener.remove(); //same as above
  //   };
  // }, 
  // []);

  // const handleKeyboardShow = (event: KeyboardEvent) => {  // need this to handle keyboard appearing
  //   Animated.timing(shiftValue, {
  //     toValue: -event.endCoordinates.height / 2, 
  //     duration: 300, 
  //     useNativeDriver: true,
  //   }).start();
  // };

  // const handleKeyboardHide = () => { //to handle keyboard dissappearing
  //   Animated.timing(shiftValue, {
  //     toValue: 0,
  //     duration: 300, 
  //     useNativeDriver: true,
  //   }).start();
  // };

  const handleSignUp = () => { //currently dummy values that does not do anything need to add some form of authentication to check if it works
    console.log('Signing up with:', { username, email, password, confirmPassword });
  };
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} // For iOS, use 'padding', for Android, use 'height'
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Offset to ensure content moves correctly
      style={{ flex: 1 }}
      >
   
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* <Animated.View style={[styles.animatedContainer, { transform: [{ translateY: shiftValue }] }]}> */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome to What2Wear</Text>
            </View>

            <Text style={styles.heading}>Create a free account Today!</Text>
            {/* input for username values*/}
            <View style={styles.inputContainer}>   
              <TextInput
                placeholder="Username"
                placeholderTextColor="#94adc7"
                style={styles.input}
                value={username}
                onChangeText={setUsername}
              />
            </View>

            {/* Input for Email values */}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#94adc7"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>

            {/* Input for Password values */}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Password"
                secureTextEntry={!showPassword}
                placeholderTextColor="#94adc7"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                textContentType="newPassword"
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            {/* Input for confrim password values */}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#94adc7"
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                textContentType="newPassword"
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Text style={styles.toggleText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            {/* Sign up button can be changed */}
            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>

            {/* DOn't know if we need this or not  */}
            <Text style={styles.termsText}>
              By continuing, you agree to the Terms of Use and Privacy Policy.
            </Text>

            {/* This will redirect to login page if the user has login details */}
            <TouchableOpacity>
              <Link href="/auth/SigninforWhat2Wear">
                <Text style={styles.loginText}>Already have an account? Log in.</Text>
              </Link>
            </TouchableOpacity>
          {/* </Animated.View> */}
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121a21',
  },
  scrollContainer: {
    alignItems: 'center',
    padding: 16,
  },
  animatedContainer: {
    width: '100%',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    width: '90%',
    marginBottom: 16,
    backgroundColor: '#253646',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
  },
  toggleText: {
    color: '#94adc7',
  },
  signUpButton: {
    backgroundColor: '#378fe6',
    padding: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',  
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsText: {
    color: '#94adc7',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginText: {
    color: '#94adc7',
    textDecorationLine: 'underline',
  },
});

export default SignUpPage;
