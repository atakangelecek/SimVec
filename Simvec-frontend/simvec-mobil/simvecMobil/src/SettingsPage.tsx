import React, {useState} from 'react';
import {View, Text, Switch, Button, StyleSheet} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

function SettingsPage({navigation}) {
  const {t, i18n} = useTranslation();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const toggleNotifications = () =>
    setIsNotificationsEnabled(previousState => !previousState);

  const toggleTheme = () => setIsDarkTheme(previousState => !previousState);

  const handleBackToProfile = () => {
    navigation.navigate('User'); // Adjust this according to your actual route name
  };

  const changeLanguage = lang => {
    i18n.changeLanguage(lang);
    setSelectedLanguage(lang);
  };
  // Function to toggle between English and French
  const toggleLanguage = () => {
    let newLang;
    switch (i18n.language) {
      case 'en':
        newLang = 'fr';
        break;
      case 'fr':
        newLang = 'tr';
        break;
      case 'tr':
        newLang = 'en';
        break;
      default:
        newLang = 'en'; // Default to English if current language is unrecognized
    }
    i18n.changeLanguage(newLang);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('Settings')}</Text>

      <View style={styles.setting}>
        <Text style={styles.settingText}>{t('Enable Notifications')}</Text>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={isNotificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleNotifications}
          value={isNotificationsEnabled}
        />
      </View>

      <View style={styles.setting}>
        <Text style={styles.settingText}>{t('Dark Theme')}</Text>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={isDarkTheme ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleTheme}
          value={isDarkTheme}
        />
      </View>

      <View style={styles.setting}>
        <Text style={styles.settingText}>{t('Language')}</Text>
        <RNPickerSelect
          onValueChange={value => changeLanguage(value)}
          items={[
            {label: 'English', value: 'en'},
            {label: 'Français', value: 'fr'},
            {label: 'Türkçe', value: 'tr'},
            {label: 'Español', value: 'sp'},
            {label: 'Deutsch', value: 'de'},
            {label: 'Italiano', value: 'it'},
          ]}
          value={selectedLanguage}
          style={pickerSelectStyles}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={t('Back to Profile')}
          onPress={handleBackToProfile}
          color="#ff6347"
        />
      </View>

      <View style={styles.buttonContainer}>
              <Button
                title={t('Frequently Asked Questions')}
                onPress={() => navigation.navigate('FAQ')}
                color="#ff6347"
              />
            </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  settingText: {
    fontSize: 18,
    color: 'gray',
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
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
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
});

export default SettingsPage;
