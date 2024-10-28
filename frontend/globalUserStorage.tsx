// Auth.ts
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

// Define the AuthState for managing user session data
interface AuthState {
  isLoggedIn: boolean;
  initialized: boolean;
  user: User | null;
  userDisplayName?: string;
}

// Initialize the AuthStore with default values
export const AuthStore = new Store<AuthState>({
  isLoggedIn: false,
  initialized: false,
  user: null,
  userDisplayName: '',
});

// Helper function to handle delayed initialization to ensure stable state
const initializeSessionAsync = async () => {
  return new Promise<void>((resolve) => {
    onAuthStateChanged(auth, (user) => {
      AuthStore.update((store) => {
        store.user = user;
        store.isLoggedIn = !!user;
        store.userDisplayName = user?.displayName || '';
        store.initialized = true;
      });
      console.log(user ? "User session restored:" : "No active user session.", user);
      resolve();
    });
  });
};

// Call the async function to ensure initialization is completed before app use
initializeSessionAsync();

// Sign-In Function
export const appSignIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    AuthStore.update((store) => {
      store.user = user;
      store.isLoggedIn = true;
      store.userDisplayName = user.displayName || '';
    });
    console.log("User signed in:", user);
    return { user };
  } catch (error) {
    console.error("Sign-in error:", error);
    return { error };
  }
};

// Sign-Out Function
export const appSignOut = async () => {
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

// Sign-Up Function
export const appSignUp = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Set display name for the user
    await updateProfile(user, { displayName });
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

// Register AuthStore in DevTools for debugging
registerInDevtools({ AuthStore });

// Custom Hook for Initialization State
export const useAuthLoading = () => {
  const { initialized } = AuthStore.useState((state) => ({
    initialized: state.initialized,
  }));
  return !initialized;
};

// Custom Hook for User State
export const useAuthUser = () => {
  const { user, initialized } = AuthStore.useState((state) => ({
    user: state.user,
    initialized: state.initialized,
  }));
  return initialized ? user : null;
};

// Usage Example in Component:
// import { useAuthLoading, useAuthUser } from '@/path/to/Auth.ts';

// const SomeComponent = () => {
//   const isLoading = useAuthLoading();
//   const user = useAuthUser();

//   if (isLoading) return <LoadingScreen />;
//   return <Text>{user ? `Welcome back, ${user.displayName}` : "Please log in"}</Text>;
// };
