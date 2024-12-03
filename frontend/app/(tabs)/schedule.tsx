import React, { useRef, useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, Stack } from 'expo-router'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, DateData } from 'react-native-calendars'; // Import the calendar component

// Defining the type for the navigation prop based on  routes
type RootStackParamList = {
    index: undefined;
    style: undefined; 
  };
  
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'index'>;
  
// Create the CurrentDateDisplay Component
const CurrentDateDisplay = () => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long', 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setCurrentDate(formattedDate);
  }, []);

  return (
    <Text style={styles.dateText}>{currentDate}</Text>
  );
};

export default function Index() {
  const modalizeRef = useRef<Modalize>(null);
  const [currentMonth, setCurrentMonth] = useState<string>(new Date().toISOString().split('T')[0].slice(0, 7)); // format: YYYY-MM

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  // Create a navigation reference for buttons to navigate to diff tabs 
  const navigation = useNavigation<NavigationProp>(); // Use the defined navigation prop type

  // Function to handle navigation to the "Style" tab to create a new outfit 
  const handleCreateNewOutfit = () => {
      navigation.navigate('style'); 
  };

  const handleMonthChange = (direction: string) => {
    const current = new Date(currentMonth);
    if (direction === 'next') {
      current.setMonth(current.getMonth() + 1);
    } else if (direction === 'prev') {
      current.setMonth(current.getMonth() - 1);
    }
    const newMonth = current.toISOString().split('T')[0].slice(0, 7); // format: YYYY-MM
    setCurrentMonth(newMonth);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Schedule Your Style</Text>
          <TouchableOpacity style={styles.menuButton} onPress={onOpen}>
            <Text style={styles.menuText}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Add the CurrentDateDisplay Component Below the Header */}
        <CurrentDateDisplay />

        {/* Add the Calendar with month navigation */}
        <View style={styles.calendarContainer}>
          {/*<TouchableOpacity onPress={() => handleMonthChange('prev')} style={styles.navButton}>
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity> */}
          
          <Calendar
            current={currentMonth}
            onMonthChange={(date: DateData) => setCurrentMonth(date.dateString)}
            style={styles.calendar}
          />
          
          {/* <TouchableOpacity onPress={() => handleMonthChange('next')} style={styles.navButton}>
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity> */}
        </View>

        {/* Centered Section */}
        <View style={styles.centeredSection}>
          <Text style={styles.planText}>Plan your style for this day:</Text>
          
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
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Modalize>
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
    position: 'relative', 
    marginBottom: 20,
    paddingBottom: 10, 
  },
  headerText: {
    color: '#000000',
    fontSize: 28,
    fontWeight: 'bold',
  },
  menuButton: {
    position: 'absolute',
    right: 20, // Position the menu on the right
    top: 60,  // Adjust according to header height
  },
  menuText: {
    fontSize: 40,
    color: '#000',
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
  dateText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 5,
    marginBottom: 5,
    color: '#333',
  },
  calendarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 24,
    color: '#000',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 10,
  },

});
