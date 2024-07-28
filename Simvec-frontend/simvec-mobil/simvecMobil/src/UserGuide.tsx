import React, {useState} from 'react';
import {Modal, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {faArrowCircleRight} from '@fortawesome/free-solid-svg-icons/faArrowCircleRight';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

const OverlayGuide = ({isVisible, onDismiss, step, position}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={isVisible}
    onRequestClose={onDismiss}>
    {position && (
      <>
        <View style={[styles.centeredView]}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{step.text}</Text>

            <TouchableOpacity style={styles.button} onPress={onDismiss}>
              <Text style={styles.textStyle}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    )}
  </Modal>
);

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'white', // or any color to match your design
    position: 'absolute',
    transform: [{rotate: '90deg'}], // adjust rotation based on the arrow direction
  },
  modalView: {
    margin: 20,
    backgroundColor: '#ffffff',

    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    opacity: 50,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'black',
    fontWeight: 'bold',
  },
});

export default OverlayGuide;
