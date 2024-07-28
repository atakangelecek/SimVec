import React, {useState, useEffect, useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Slider from '@react-native-community/slider';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Alert,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {PermissionsAndroid} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {faUser, faCamera} from '@fortawesome/free-solid-svg-icons';
import {faGear} from '@fortawesome/free-solid-svg-icons/faGear';
import RNFS from 'react-native-fs';
import ImageCropPicker from 'react-native-image-crop-picker';
import logo from './assets/simvec.png';
import {faRotate} from '@fortawesome/free-solid-svg-icons';
import {faBook} from '@fortawesome/free-solid-svg-icons/faBook';
import {faArrowCircleUp} from '@fortawesome/free-solid-svg-icons/faArrowCircleUp';
import OverlayGuide from './UserGuide';

function MainPage() {
  const {t, i18n} = useTranslation();
  const [text, setText] = useState('');
  const [searchNumber, setSearchNumber] = useState(5);
  const [imageList, setImageList] = useState([]);
  const [imageFilesName, setImageFilesName] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // State to track modal visibility
  const [isButtonPressed, setIsButtonPressed] = useState(false); // State to track button press
  const handlePressIn = () => setIsButtonPressed(true); // Handle button press
  const handlePressOut = () => setIsButtonPressed(false); // Handle button release
  const slideAnim = new Animated.Value(0); // Animation for slide-in effect
  const [image, setImage] = useState<{uri: string; base64?: string} | null>(
    null,
  );
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width; // Get the screen width
  const buttonWidth = screenWidth / 3;
  const data = {
    input: text,
    topk: searchNumber,
  };

  const user_info = {
    username: 'alper',
  };

  const profileButtonRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const syncButtonRef = useRef(null);
  const userGuideRef = useRef(null);
  const textInputRef = useRef(null);
  const sliderRef = useRef(null);
  const textSubmitButton = useRef(null);

  const imagePickerRef = useRef(null);
  const imageSubmitButton = useRef(null);
  const guideSteps = [
    {
      text: 'You can see your profile by clicking on this button',
      ref: profileButtonRef,
    },
    {
      text: 'You can reach your settings by clicking on here.',
      ref: settingsButtonRef,
    },
    {
      text: 'Press this button to synchronize your images with database.',
      ref: syncButtonRef,
    },
    {text: 'Reach user guide anytime you need.', ref: userGuideRef},
    {text: 'You can write your text here.', ref: textInputRef},
    {
      text: 'Use this slider to adjust the number of photos you want to retrieve.',
      ref: sliderRef,
    },
    {
      text: 'You can send your text query clicking on here.',
      ref: textSubmitButton,
    },

    {text: 'Select an image to upload.', ref: imagePickerRef},
    {text: 'Submit your image clicking by here.', ref: imageSubmitButton},
    {text: 'You are ready to use SimVec!', ref: imageSubmitButton},
  ];

  const [currentElementPosition, setCurrentElementPosition] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const measureAndDisplayGuide = index => {
    setCurrentStepIndex(0);
    guideSteps[index]['ref'].current.measure(
      (x, y, width, height, pageX, pageY) => {
        setCurrentElementPosition({x: pageX, y: pageY, width, height});
        setCurrentStepIndex(0);
        setShowGuide(true);
      },
    );
  };

  const handleGuideNext = () => {
    if (currentStepIndex < guideSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setShowGuide(false); // End the guide
    }
  };

  const handleTextSubmit = async e => {
    e.preventDefault();
    if (!text) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(
        'http://192.168.221.8:8080/api/text-based-search',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );

      const base64Images = await response.json();

      const urls = base64Images.map(
        base64 => `data:image/jpeg;base64,${base64}`,
      );
      setImageList(urls);
      console.log(imageList);
    } catch (error) {
      console.error('Error processing text:', error);
      Alert.alert('Error', 'Error processing text');
    }
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible); // Toggle modal visibility
    if (isModalVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(); // Slide-out animation
    } else {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(); // Slide-in animation
    }
  };

  const handleImageChange = () => {
    ImageCropPicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      includeBase64: true,
    })
      .then(image => {
        setImage({
          uri: image.path,
          base64: image.data,
        });
      })
      .catch(error => {
        console.log('ImagePicker Error: ', error);
      });
  };

  const checkAndRequestPermissions = async () => {
    try {
      // Check if the permission has already been granted
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      if (granted) {
        await AsyncStorage.setItem('cameraPermission', 'granted');
        return true;
      } else {
        // Request the permission if it hasn't been granted
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take pictures.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          await AsyncStorage.setItem('cameraPermission', 'granted');
          return true;
        } else {
          console.error('Camera permission denied');
          return false;
        }
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleCaptureImage = async () => {
    const hasPermission = await checkAndRequestPermissions();
    if (!hasPermission) {
      console.error('Camera permission denied');
      return;
    }

    ImageCropPicker.openCamera({
      width: 300,
      height: 300,
      cropping: true,
      includeBase64: true,
    })
      .then(image => {
        setImage({
          uri: image.path,
          base64: image.data,
        });
      })
      .catch(error => {
        console.log('ImagePicker Error: ', error);
      });
  };

  const handleImageSubmit = async () => {
    if (!image || !image.base64) {
      Alert.alert('Error', 'Please select an image to upload');
      return;
    }
    const formData = new FormData(); // Create a FormData object
    console.log('image.uri in handleImageSubmit: ', image.uri);
    formData.append('file', {
      name: 'uploaded_image.jpg',
      type: 'image/jpeg',
      uri: image.uri,
    });
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(
        `http://192.168.221.8:8080/api/image-based-search/${searchNumber}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const base64Images: string[] = await response.json();
      const urls = base64Images.map(
        base64 => `data:image/jpeg;base64,${base64}`,
      );
      setImageList(urls);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Error uploading image');
    }
  };

  const getGalleryImageNames = async () => {
    const directories = [
      RNFS.DownloadDirectoryPath,
      RNFS.DocumentDirectoryPath,
      RNFS.PicturesDirectoryPath,
    ];
    const picturesPath = RNFS.PicturesDirectoryPath;
    console.log('picturesPath', picturesPath);

    let imageNames: any[] = [];
    let imagePaths: any[] = [];
    let imageDict = {};
    for (const dir of directories) {
      console.log(dir);
      try {
        const files = await RNFS.readDir(dir);
        console.log('files: ', files);
        const imageFiles = files.filter(file =>
          ['jpg', 'jpeg', 'png', 'gif'].some(ext => file.name.endsWith(ext)),
        );
        console.log('imageFiles: ', imageFiles);
        //imageNames = imageNames.concat(imageFiles.map(file => file.name));
        imageNames = imageNames.concat(imageFiles.map(file => file.name));
        imagePaths = imagePaths.concat(imageFiles.map(file => file.path));
        // Store each image name and path in the dictionary
        imageFiles.forEach(file => {
          imageDict[file.name] = file.path;
        });
      } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
      }
    }
    console.log('Image dictionary:', imageDict);
    return imageDict;
  };

  const synchronizationHandler = async () => {
    console.log('Sending request to synchronize images');

    try {
      const token = await AsyncStorage.getItem('userToken');

      const formData1 = new FormData();
      formData1.append('username', user_info.username);

      const response1 = await fetch(
        'http://192.168.221.8:8080/api/synchronize-images',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          body: formData1,
        },
      );

      if (!response1.ok) {
        console.error('Failed to synchronize:', await response1.json());
        return;
      }

      const backendImageFiles = await response1.json(); // Image names from backend
      const galleryImageFilesPaths = await getGalleryImageNames(); // Image names from gallery

      // Convert the dictionary keys to an array of image names
      const galleryImageNames = Object.keys(galleryImageFilesPaths);

      const imagesToDelete = backendImageFiles.filter(
        img => !galleryImageNames.includes(img),
      );

      console.log(
        'Images that need to be deleted from backend: ',
        imagesToDelete,
      );
      // Step 3: Find images to add to backend
      const imagesToAdd = galleryImageNames.filter(
        img => !backendImageFiles.includes(img),
      );

      console.log('Images that need to be added to backend: ', imagesToAdd);

      const formData2 = new FormData();
      formData2.append('username', user_info.username);
      formData2.append('images_to_delete', JSON.stringify(imagesToDelete));

      // Step 5: Add actual image files for images to be added
      /*const imageFile = await RNFS.readFile(
          RNFS.PicturesDirectoryPath + '/' + imageName,
          'base64',
        ); // Read image as base64*/

      const imageFilesToUpload = []; // This array will hold image files to be uploaded
      for (const imageName of imagesToAdd) {
        // Assuming you have a way to retrieve the actual image file by name
        const imageFile = await RNFS.readFile(
          galleryImageFilesPaths[imageName],
          'base64',
        );
        console.log(
          'galleryImageFilesPaths[imageName]',
          galleryImageFilesPaths[imageName],
        );
        imageFilesToUpload.push({
          uri: 'file://' + galleryImageFilesPaths[imageName], // Data URI format
          name: imageName, // Filename
          type: 'image/jpeg', // MIME type
        });
      }

      //console.log('imageFilesToUpload: ', imageFilesToUpload);
      console.log('imageFilesTodelete: ', imagesToDelete);

      imageFilesToUpload.forEach(image => {
        formData2.append('images_to_add', {
          uri: image.uri,
          name: image.name,
          type: image.type,
        });
        console.log(image);
      });

      // Send the second request with form-data
      const response2 = await fetch(
        'http://192.168.221.8:8080/api/add-delete-images',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          body: formData2,
        },
      );

      if (!response2.ok) {
        console.error(
          'Synchronization request failed:',
          await response2.json(),
        );
        throw new Error('Network response was not ok: ${response2.status}');
      }

      const formData3 = new FormData();
      formData3.append('user_id', user_info.username);
      formData3.append('operation', 'delete');
      formData3.append('updated_images', JSON.stringify(imagesToDelete));

      const response3 = await fetch(
        'http://192.168.221.8:8000/api/synchronization',
        {
          method: 'POST',
          body: formData3,
        },
      );
      if (!response3.ok) {
        throw new Error('Network response was not ok');
      }

      const formData4 = new FormData();
      formData4.append('user_id', user_info.username);
      formData4.append('operation', 'insert');

      imageFilesToUpload.forEach(image => {
        formData4.append('updated_images', {
          uri: image.uri,
          name: image.name,
          type: image.type,
        });
      });

      const response4 = await fetch(
        'http://192.168.221.8:8000/api/synchronization',
        {
          method: 'POST',
          body: formData4,
        },
      );
      if (!response4.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response4.json();
      console.log('Synchronization completed successfully', result);

      console.log('Synchronization completed successfully');
    } catch (error) {
      console.error('Error during synchronization:', error);
      Alert.alert('Error', 'Failed to synchronize images');
    }
  };

  const handleSliderChange = value => {
    setSearchNumber(Math.floor(value));
  };

  const highlightedStyle = {backgroundColor: 'orange'};

  return (
    <ScrollView style={styles.container}>
      <OverlayGuide
        isVisible={showGuide}
        onDismiss={handleGuideNext}
        step={guideSteps[currentStepIndex]}
        position={currentElementPosition}
      />
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>
      {/* New view for settings and user profile buttons */}
      <View style={styles.row}>
        <TouchableOpacity
          ref={profileButtonRef}
          style={[
            styles.buttonContainer,
            isButtonPressed ? styles.buttonHover : {},
            currentStepIndex === 0 ? highlightedStyle : {}, // Apply hover style
          ]}
          onPressIn={handlePressIn} // Simulate hover
          onPressOut={handlePressOut} // Revert hover
          onPress={() => navigation.navigate('User')} // Navigate to User profile
        >
          <FontAwesomeIcon icon={faUser} />
        </TouchableOpacity>

        <TouchableOpacity
          ref={settingsButtonRef}
          style={[
            styles.buttonContainer,
            isButtonPressed ? styles.buttonHover : {},
            currentStepIndex === 1 ? highlightedStyle : {}, // Apply hover style
          ]}
          onPressIn={handlePressIn} // Simulate hover
          onPressOut={handlePressOut} // Revert hover
          onPress={() => navigation.navigate('Settings')} // Navigate to Settings
        >
          <FontAwesomeIcon icon={faGear} />
        </TouchableOpacity>

        <TouchableOpacity
          ref={syncButtonRef}
          style={[
            styles.buttonContainer,
            isButtonPressed ? styles.buttonHover : {},
            currentStepIndex === 2 ? highlightedStyle : {}, // Apply hover style
          ]}
          onPressIn={handlePressIn} // Simulate hover
          onPressOut={handlePressOut} // Revert hover
          onPress={synchronizationHandler} // Placeholder action
        >
          <FontAwesomeIcon icon={faRotate} />
          <Text style={styles.buttonText}>Synchronize</Text>
        </TouchableOpacity>

        <TouchableOpacity
          ref={userGuideRef}
          style={[
            styles.buttonContainer,
            isButtonPressed ? styles.buttonHover : {}, // Apply hover style
            currentStepIndex === 3 ? highlightedStyle : {},
          ]}
          onPressIn={handlePressIn} // Simulate hover
          onPressOut={handlePressOut} // Revert hover
          onPress={() => measureAndDisplayGuide(0)}
          // Placeholder action
        >
          <FontAwesomeIcon icon={faBook} />
          <Text style={styles.buttonText}>User Guide</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.textAreaContainer,
          currentStepIndex === 4 ? highlightedStyle : {},
        ]}>
        <Text style={styles.label}>Enter text for search:</Text>
        <TextInput
          ref={textInputRef}
          style={styles.textArea}
          value={text}
          onChangeText={setText}
          placeholder="Type here..."
          multiline
        />
      </View>
      <View style={[styles.centerContainer, ,]} ref={sliderRef}>
        {/* Center the button */}
        <View
          style={[
            {width: buttonWidth * 2}, // Set the button width
            styles.sliderContainer,
            currentStepIndex === 5 ? highlightedStyle : {},
          ]}>
          <Text
            style={[
              {width: buttonWidth * 2}, // Set the button width
              styles.label,
            ]}>
            Select Number of Results: {searchNumber}
          </Text>
          <Slider
            style={[{width: buttonWidth * 2, height: 30}, styles.slider]}
            minimumValue={1} // Minimum value for the slider
            maximumValue={10} // Maximum value for the slider
            step={1} // Step size for the slider
            value={searchNumber} // Current value for the slider
            onValueChange={handleSliderChange} // Event handler when the slider value changes
            minimumTrackTintColor="#75A47F" // Color for the active part of the slider
            maximumTrackTintColor="#d3d3d3" // Color for the inactive part of the slider
            thumbTintColor="#75A47F" // Color for the thumb (slider handle)
          />
        </View>
        <TouchableOpacity
          ref={textSubmitButton}
          style={[
            {width: buttonWidth}, // Set the button width
            styles.submitButtonContainer,
            isButtonPressed ? styles.submitButtonHover : {},
            currentStepIndex === 6 ? highlightedStyle : {}, // Apply hover style
          ]}
          onPressIn={handlePressIn} // Simulate hover
          onPressOut={handlePressOut} // Revert hover
          onPress={handleTextSubmit} // Placeholder action
        >
          <Text style={styles.submitButtonText}>Submit Text</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        ref={imagePickerRef}
        style={[
          styles.imagePicker,
          currentStepIndex === 7 ? highlightedStyle : {},
        ]}
        onPress={handleImageChange}>
        {image ? (
          <Image source={{uri: image.uri}} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imagePickerText}>
            {t('Tap to select an image')}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cameraButton, isButtonPressed ? styles.buttonHover : {}]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleCaptureImage}>
        <FontAwesomeIcon icon={faCamera} />
        <Text style={styles.buttonText}>Capture Image</Text>
      </TouchableOpacity>

      <View style={[styles.centerContainer]} ref={sliderRef}>
        {/* Center the button */}
        <View
          style={[
            {width: buttonWidth * 2}, // Set the button width
            styles.sliderContainer,
          ]}>
          <Text
            style={[
              {width: buttonWidth * 2}, // Set the button width
              styles.label,
              currentStepIndex === 5 ? highlightedStyle : {},
            ]}>
            Select Number of Results: {searchNumber}
          </Text>
          <Slider
            style={[{width: buttonWidth * 2, height: 30}, styles.slider]}
            minimumValue={1} // Minimum value for the slider
            maximumValue={10} // Maximum value for the slider
            step={1} // Step size for the slider
            value={searchNumber} // Current value for the slider
            onValueChange={handleSliderChange} // Event handler when the slider value changes
            minimumTrackTintColor="#75A47F" // Color for the active part of the slider
            maximumTrackTintColor="#d3d3d3" // Color for the inactive part of the slider
            thumbTintColor="#75A47F" // Color for the thumb (slider handle)
          />
        </View>
        <TouchableOpacity
          ref={imageSubmitButton}
          style={[
            {width: buttonWidth}, // Set the button width
            styles.submitButtonContainer,
            isButtonPressed ? styles.submitButtonHover : {},
            currentStepIndex === 8 ? highlightedStyle : {}, // Apply hover style
          ]}
          onPressIn={handlePressIn} // Simulate hover
          onPressOut={handlePressOut} // Revert hover
          onPress={handleImageSubmit} // Placeholder action
        >
          <Text style={styles.submitButtonText}>Upload Image</Text>
        </TouchableOpacity>
      </View>

      {imageList.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.subheading}>Returned Images:</Text>
          {imageList.map((imgSrc, index) => (
            <Image
              key={index}
              source={{uri: imgSrc}}
              style={styles.resultImage}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  guidedPart: {
    color: '#f0f0f0',
  },
  centerContainer: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    justifyContent: 'center', // Center the button horizontally
    alignItems: 'center', // Align content at the center
    paddingVertical: 2, // Vertical padding for consistency
  },
  buttonText: {
    marginLeft: 10, // Space between icon and text
    color: '#555',
  },
  submitButtonText: {
    color: '#fff', // White text
    fontWeight: 'bold', // Make the text bold
    fontSize: 15, // Increase font size
  },
  sliderContainer: {
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center', // Center icon and text
    paddingHorizontal: 20, // Padding on the sides
    paddingVertical: 1, // Padding on the top and bottom
    backgroundColor: '#fff', // Background color
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Make space between buttons
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row', // Horizontal alignment
    alignItems: 'center', // Center icon and text
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  submitButtonContainer: {
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center', // Center icon and text
    padding: 5,
    backgroundColor: '#75A47F',
    borderRadius: 5,
  },
  buttonHover: {
    backgroundColor: '#dcdcdc', // Background color on press (hover effect)
  },
  submitButtonHover: {
    backgroundColor: '#BACD92', // Background color on press (hover effect)
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dedede',
  },
  logo: {
    width: '60%',
    height: 120,
  },
  textAreaContainer: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  label: {
    justifyContent: 'center',
    color: '#555',
    marginBottom: 5,
  },
  slider: {
    justifyContent: 'center',
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    height: 50,
    fontSize: 16,
    textAlignVertical: 'top',
    color: '#333',
  },
  imagePicker: {
    marginBottom: 10,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d7d7d7',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    height: 100,
    marginHorizontal: 20,
  },
  imagePickerText: {
    color: '#808080',
    textAlign: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  cameraButton: {
    marginBottom: 20,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    flexDirection: 'row',
  },
  resultsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  subheading: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  resultImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default MainPage;
