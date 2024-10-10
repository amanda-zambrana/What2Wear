import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3dc8ff',
        headerStyle: {
          backgroundColor: '#3dc8ff',
        },
        headerShadowVisible: false,
        headerTintColor: '#000000',
        tabBarStyle: {
          backgroundColor: '#25292e',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false, // Hides the header for this screen
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          headerShown: false, // Hides the header for this screen
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="style"
        options={{
          title: 'Style',
          headerShown: false, // Hides the header for this screen
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'layers-sharp' : 'layers-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: 'Wardrobe',
          headerShown: false, // Hides the header for this screen
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'briefcase-sharp' : 'briefcase-outline'} color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
