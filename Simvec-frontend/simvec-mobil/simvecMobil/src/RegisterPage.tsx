import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
// Assuming simvec.png is correctly placed in your assets folder
import logo from './assets/simvec.png';
import {Picker} from '@react-native-picker/picker'; // New import from @react-native-picker/picker
import RNPickerSelect from 'react-native-picker-select';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedModel, setSelectedModel] = useState('recommended');
  const [errors, setErrors] = useState('');
  const {t, i18n} = useTranslation();
  // Get the navigation prop
  const navigation = useNavigation();

  const handleRegisterSubmit = async () => {
    const userData = {
      username: name,
      email: email,
      password: password,
      roles: 'ROLE_USER',
    };

    try {
      const response = await fetch('http://192.168.221.8:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData);
        console.error('Registration failed:', errorData);
      } else {
        console.log('Registration successful!');
        setErrors('');
        navigation.navigate('Login'); // Use the correct name of your main page route
      }
    } catch (error) {

      console.error('Error during registration:', error);
    }
  };

  return (
    <>
      <View style={styles.imageHeader}>
        <Image source={logo} style={styles.websiteLogo} resizeMode="contain" />
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.header}></View>
          <View style={styles.registerContainer}>
            <Text style={styles.registerHeading}>{t('Register')}</Text>

            <TextInput
              style={styles.input}
              onChangeText={setName}
              value={name}
              placeholder={t('Name')}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              onChangeText={setEmail}
              value={email}
              placeholder={t('Email')}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              onChangeText={setPassword}
              value={password}
              placeholder={t('Password')}
              secureTextEntry={true}
              autoCapitalize="none"
            />
            <Text style={styles.label}>{t('Select a Model')}</Text>

            <Picker
              selectedValue={selectedModel}
              style={styles.picker}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedModel(itemValue)
              }>
              <Picker.Item
                label={t('Standard Version (High accuracy)')}
                value="recommended"
              />
              <Picker.Item
                label={t('Advanced Version (Better in complex queries)')}
                value="advanced"
              />
            </Picker>

            {errors.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}
            <Button
              onPress={handleRegisterSubmit}
              title={t('Register')}
              color="#841584" // Example color
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  header: {},
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4', // A light grey background
  },
  imageHeader: {
    width: '100%',
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  websiteLogo: {
    width: '90%', // Less than 100% to give some padding on the sides
    height: 120, // A bit larger height for a prominent logo
    marginTop: 50, // Move the logo down a bit from the top of the screen
    alignSelf: 'center',
  },
  registerContainer: {
    width: '90%', // Make the container a bit narrower for tablet and large screen support
    borderRadius: 10, // Rounded corners
    backgroundColor: '#ffffff', // A white background for the form
    padding: 20, // Inside padding
    elevation: 3, // Shadow for Android
    shadowColor: '#000000', // Shadow color for iOS
    shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
    shadowOpacity: 0.1, // Shadow opacity for iOS
    shadowRadius: 4, // Shadow blur for iOS
    marginTop: -60, // Pull the register container up to overlap the logo
  },
  registerHeading: {
    fontSize: 28,
    fontWeight: '700', // A bolder weight for the heading
    color: '#333333', // A darker color for the text
    marginBottom: 30, // More space below the heading
    textAlign: 'center', // Center align the text
  },
  input: {
  color: '#000000',
    height: 50, // A taller input for easier touch
    marginBottom: 15, // Increase space between inputs
    borderWidth: 1,
    borderColor: '#cccccc', // A lighter border color
    borderRadius: 5, // Rounded corners for the input fields
    padding: 10,
    backgroundColor: '#ffffff', // A white background for the input
    fontSize: 16, // Slightly larger font size
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
export default RegisterPage;
