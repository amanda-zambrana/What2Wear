import React from 'react';
import { registerRootComponent } from 'expo';
import { Slot } from 'expo-router';

// Main App component that uses `Slot` from expo-router to render all child components based on the routes
export default function App() {
  return <Slot />;
}

// Register the root component with Expo so that the app can launch correctly
registerRootComponent(App);
