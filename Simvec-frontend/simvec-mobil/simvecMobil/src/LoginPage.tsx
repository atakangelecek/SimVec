import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
// Assuming simvec.png is correctly placed in your assets folder
import logo from './assets/simvec.png';

function LoginPage() {
  const {t, i18n} = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState('');

  // Get the navigation prop
  const navigation = useNavigation();

  const handleLoginSubmit = async () => {
    const loginData = {
      username: email,
      password: password,
    };

    try {
      const response = await fetch('http://192.168.221.8:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      console.log(response.text);
      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData);
        console.error('Login failed:', errorData);
      } else {
        console.log('Login successful!');
        const token = await response.text();
        await AsyncStorage.setItem('userToken', token);
        setErrors('');
        navigation.navigate('Main'); // Adjust with your main page route name
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  // Function to navigate to RegisterPage
  const navigateToRegister = () => {
    navigation.navigate('Register'); // Use the correct name of your register page route
  };

  return (
    <>
      <View style={styles.imageHeader}>
        <Image source={logo} style={styles.websiteLogo} resizeMode="contain" />
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.header}></View>
          <View style={styles.loginContainer}>
            <Text style={styles.loginHeading}>{t('Login')}</Text>
            {/* Email and Password Inputs */}
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

            <TouchableOpacity
              onPress={handleLoginSubmit}
              style={styles.loginButton}>
              <Text style={styles.loginButtonText}>{t('Login')}</Text>
            </TouchableOpacity>

            {/* Register Navigation Button */}
            <TouchableOpacity
              onPress={navigateToRegister}
              style={styles.registerButton}>
              <Text style={styles.registerButtonText}>
                {t("Don't have an account? Register")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  // Existing styles remain the same
  header: {},
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  imageHeader: {
    width: '100%',
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  websiteLogo: {
    width: '90%',
    height: 120,
    marginTop: 50,
    alignSelf: 'center',
  },
  loginContainer: {
    width: '90%',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    padding: 20,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: -60,
  },
  loginHeading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 30,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#841584', // Use your app's theme color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center', // Center button in the container
  },
  loginButtonText: {
    color: '#FFFFFF', // White color for the text
    fontSize: 16,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: 20, // Provide some space from the login button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#841584', // Border color matches the login button background
    alignSelf: 'center', // Center button in the container
  },
  registerButtonText: {
    color: '#841584', // Text color matches the login button background
    fontSize: 16,
    textAlign: 'center',
  },
  input: {
  color: '#000000',
    height: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  // Rest of the styles remain unchanged
});

export default LoginPage;
