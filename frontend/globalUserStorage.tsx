import { Store, registerInDevtools } from "pullstate";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "./app/auth/firebaseconfig";

interface AuthState {       //DEFINING AUTHSTATE for managing user data very IMP!!!!!!!!
  isLoggedIn: boolean;
  initialized: boolean;
  user: User | null;
  userDisplayName?: string;
  userToken?: string | null;
}

export const AuthStore = new Store<AuthState>({ //initializing authstore ( placeholder for user sessionS STATE)
  isLoggedIn: false,
  initialized: false,
  user: null,
  userDisplayName: '',
  userToken: null,
});

const initializeSessionAsync = async () => {        //handling intialization to make ssure user state is stable
  return new Promise<void>((resolve) => {
    onAuthStateChanged(auth, (user) => {
      AuthStore.update((store) => {
        store.user = user;
        store.isLoggedIn = !!user;
        store.userDisplayName = user?.displayName || '';
        store.initialized = true;
        console.log("AuthStore updated:", store);
      });
      console.log(user ? "User session restored:" : "No active user session.", user);
      resolve();
    });
  });
};

// Call the async function to ensure initialization is completed before app use
initializeSessionAsync();

export const appSignIn = async (email: string, password: string) => {   //sign-in function
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token =await user.getIdToken();
    AuthStore.update((store) => {
      store.user = user;
      store.isLoggedIn = true;
      store.userDisplayName = user.displayName || '';
      store.userToken = token;
    });
    console.log("User signed in:", user);
    return { user, token };
  } catch (error) {
    console.error("Sign-in error:", error);
    return { error };
  }
};

export const appSignOut = async () => {         //sign-out function
  try {
    await signOut(auth);
    AuthStore.update((store) => {
      store.user = null;
      store.isLoggedIn = false;
      store.userDisplayName = '';
    });
    console.log("User signed out");
    return { user: null };
  } catch (error) {
    console.error("Sign-out error:", error);
    return { error };
  }
};


export const appSignUp = async (email: string, password: string, displayName: string) => { //siggn up functionality
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
   
    await updateProfile(user, { displayName }); //setting dynamic user display name
    AuthStore.update((store) => {
      store.user = user;
      store.isLoggedIn = true;
      store.userDisplayName = displayName;
    });
    console.log("User signed up and profile updated:", user);
    return { user };
  } catch (error) {
    console.error("Sign-up error:", error);
    return { error };
  }
};

registerInDevtools({ AuthStore });      //debug and syntax purposes

export const useAuthLoading = () => {       //custom HOOK FOR WHEN WE GET TO USING USER STATES FOR QUERING INFO ABOUT WARDROBES AND OTHER STUFF
  const { initialized } = AuthStore.useState((state) => ({
    initialized: state.initialized,
  }));
  return !initialized;
};

export const useAuthUser = () => {      // SAME AS ABOVE
  const { user, initialized } = AuthStore.useState((state) => ({
    user: state.user,
    initialized: state.initialized,
  }));
  return initialized ? user : null;
};

// import { useAuthLoading, useAuthUser } from '@/path/to/Auth.ts';

// const SomeComponent = () => {
//   const isLoading = useAuthLoading();
//   const user = useAuthUser();

//   if (isLoading) return <LoadingScreen />;
//   return <Text>{user ? `Welcome back, ${user.displayName}` : "Please log in"}</Text>;
// };

export const sendAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {}
) => {
  // Get the user from AuthStore
  const user = AuthStore.getRawState().user;

  if (!user) {
    console.error("User is not logged in");
    throw new Error("User is not logged in");
  }

  // Retrieve the ID token
  const token = await user.getIdToken();

  // Merge the token into headers
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  console.log("Sending request to:", url);  // Log URL
  console.log("Headers:", headers);  // Log headers

  // Send the authenticated request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    console.error("Request failed with status:", response.status);  // Log error status
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  console.log("Response data:", data);  // Log response data
  return data;
};
