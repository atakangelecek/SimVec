import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button, ScrollView} from 'react-native';

const CollapsibleQuestion = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity onPress={toggleOpen}>
        <Text style={styles.question}>{question}</Text>
      </TouchableOpacity>
      {isOpen && <Text style={styles.answer}>{answer}</Text>}
    </View>
  );
};

function FaqPage({ navigation }) {
  const faqData = [
    {
      question: "What is SimVec?",
      answer: "SimVec is a mobile app that helps you find pictures in your gallery without the need to scroll endlessly. It simplifies the process of searching through a vast number of images by allowing you to search using a text query or another similar image."
    },
    {
      question: "How does SimVec work to find images in my gallery?",
      answer: "SimVec transforms your images into high-dimensional embeddings and stores them in a vector database. When you enter a query, the app searches for the closest embeddings in the vector space to your query, providing you with the most similar images."
    },
    {
      question: "Do I need to tag my photos before using SimVec?",
      answer: "No, tagging is not necessary. SimVec's unique feature is that it allows you to search in the most comfortable way without the need for predefined tags. This makes the search process flexible and user-friendly."
    },
    {
      question: "What types of queries can I use to find images in SimVec?",
      answer: "You can search using an image or a descriptive text query of any length. This flexibility allows you to use whatever information you have at hand, whether it’s a snapshot or a few words describing the image you’re looking for."
    },
    {
      question: "How do I get started with SimVec?",
      answer: "To get started with SimVec, simply register with your email and username. Once registered, you can begin uploading images from your gallery into the vector database. Start your search by uploading a photo or writing a text query. After you’ve selected the number of images you want to retrieve, click on the submit button to see the results."
    },
    {
      question: "Is my data secure when using SimVec?",
      answer: "Yes, SimVec prioritizes user data security. All data transmissions are encrypted, and images are stored securely in the cloud. The app adheres to strict data protection regulations to ensure that your information and photos remain private."
    },
    {
      question: "What technology powers SimVec’s search capabilities?",
      answer: "SimVec is powered by advanced machine learning models and a high-performance vector database technology called Milvus. The app incorporates cutting-edge technologies such as CLIP and Transformers to transform images and text into detailed numerical forms, facilitating fast and accurate similarity searches."
    },
    {
      question: "How accurate is the image retrieval with SimVec?",
      answer: "Image retrieval with SimVec is highly accurate due to the sophisticated algorithms and technologies it employs. The system measures distances between your search query and the stored data in the vector database, identifying exact matches or closely related images efficiently."
    },
    {
      question: "Can I use SimVec on any mobile device?",
      answer: "SimVec is designed to be compatible with most modern mobile devices. It is available on both Android and iOS platforms, ensuring a wide range of users can benefit from its features."
    },
    {
      question: "What happens to my images after I upload them to SimVec?",
      answer: "Once uploaded, your images are transformed into vector representations and securely stored in our vector database. These images are used to facilitate your search queries but remain private and secure."
    },
    {
      question: "How can I retrieve multiple images at once?",
      answer: "After entering your search query, you can specify the number of images you wish to retrieve. SimVec will then display the closest matches based on the vector similarities, allowing you to view multiple images simultaneously."
    },
    {
      question: "What should I do if I can’t find the image I’m looking for?",
      answer: "Try refining your search query or use different terms or images that might be closely related to what you’re searching for. If you still can’t find the desired image, it may help to check if the image has been uploaded to the vector database."
    },
    {
      question: "Is there a limit to the number of images I can search or upload?",
      answer: "SimVec allows a generous limit on the number of images you can upload and search. However, for optimal performance and to manage server loads, there might be a reasonable cap on the number of simultaneous searches or uploads. For specific limits, please refer to the app’s guidelines."
    },
    {
      question: "How can I provide feedback or report an issue with SimVec?",
      answer: "You can provide feedback or report any issues through the app’s support section. There is also an option to contact the customer service team directly via email or through the in-app messaging system."
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Frequently Asked Questions</Text>
      {faqData.map((item, index) => (
        <CollapsibleQuestion key={index} question={item.question} answer={item.answer} />
      ))}
      <Button
        title="Back to Settings"
        onPress={() => navigation.goBack()}
        color="#007BFF"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  faqItem: {
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  answer: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default FaqPage;
