import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Button, StyleSheet } from 'react-native';
import logo from './assets/user-profile-icon.jpg';

function UserPage({ navigation }) {
   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
   
   const [userInfo, setUserInfo] = useState({
       name: 'default',
       email: 'default@example.com',
       password: 'password',
       photoCount: 100,
   });

   useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://10.0.2.2:8080/api/get-user-info', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Include any authentication headers if necessary
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
         setUserInfo({
	    name: data.name,
	    email: data.email,
	    password: data.password,
	    photoCount: data.photoCount,
	});
      } catch (error) {
        console.log('Error fetching user data:', error);
        setUserInfo({
            name: 'No Data Available',
            email: 'No Data Available',
            password: '••••••••',
            photoCount: 'N/A',
            });
        }
    };
    fetchUserData();
  }, []);
    // Function to toggle password visibility
   const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
   };

  // Function to handle logout logic
  const handleLogout = () => {
    // TODO
    navigation.navigate('Login');
  };

  // Function to navigate to edit profile page
  const handleEditProfile = () => {
    // TODO
    // navigation.navigate('EditProfile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image source={logo} style={styles.profilePic} />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{userInfo.name}</Text>
          <Text style={styles.email}>{userInfo.email}</Text>
          <Text style={styles.password}>Password: {isPasswordVisible ? userInfo.password : '••••••••'}</Text>
          <TouchableOpacity style={styles.showPassword} onPress={togglePasswordVisibility}>
             <Text style={styles.showPasswordText}>Show Password</Text>
          </TouchableOpacity>
          <Text style={styles.photoCount}>Photo Count: {userInfo.photoCount}</Text>
        </View>
      </View>
      <View style={styles.buttonGroup}>
        <View style={styles.buttonContainer}>
            <Button title="Edit Profile" onPress={handleEditProfile} color="#ff6347" />
        </View>
        <View style={styles.buttonContainer}>
            <Button title="Log Out" onPress={handleLogout} color="#ff6347" />
        </View>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: '90%',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  userInfo: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 5,
  },
  password: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 5,
  },
  photoCount: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 5,
  },
  buttonGroup: {
    marginTop: 150,
    width: '85%',
  },
  buttonContainer: {
      marginBottom: 15,
  },
  showPassword: {
    paddingVertical: 4,
    paddingHorizontal: 0,
    borderRadius: 4,
    backgroundColor: 'orange',
    alignSelf: 'flex-start',
    marginTop: -3,
    marginBottom: 8,
  },
  showPasswordText: {
      color: 'white',
      fontSize: 12
  },
  profilePic: {
      width: 120,
      height: 120,
      borderRadius: 50,
      marginBottom: 10,
  },
  logo: {
    width:22,
    height:22,
    resizeMode: 'contain'
  }
});

export default UserPage;
