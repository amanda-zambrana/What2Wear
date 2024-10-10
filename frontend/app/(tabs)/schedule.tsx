import { Text, View, StyleSheet } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Schedule Your Style</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    width: '100%',
    height: 110,
    backgroundColor: '#3dc8ff', // Teal stripe
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerText: {
    color: '#000000', // Black text
    fontSize: 28,
    fontWeight: 'bold',
  },
  text: {
    color: '#000000', // Black text
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#000000', // Black text
  },
});