import {Image, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useDispatch} from 'react-redux';
import {flash} from '../../redux/features/SplashSlice';
import {responsiveWidth} from '../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
const SplashScreen = ({navigation}) => {
  const [logoURL, setLogoURL] = useState(null);
  const dispatch = useDispatch();
  const getLogo = async () => {
    await AsyncStorage.setItem('addressChange', 'false');
    const response = await axios.get('https://api.booon.in/api/flash-screen');
    const checkLogin = await AsyncStorage.getItem('@login');
    console.log(response.data, 'resp');
    if (response) {
      setLogoURL(response.data.data.logo);
      dispatch(flash(response.data));
      setTimeout(() => {
        if (checkLogin == null) {
          navigation.replace('GetStarted');
        } else {
          navigation.replace('HomeScreen');
        }
      }, 1500);
    }
  };
  useEffect(() => {
    getLogo();
  }, [navigation]);
  return (
    <View style={styles.container}>
      {logoURL && (
        <Image
          // source={require('../../assets/boonLogo.png')}
          source={{uri: logoURL}}
          style={styles.logo}
        />
      )}
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  logo: {
    height: responsiveWidth(40),
    width: responsiveWidth(150),
    resizeMode: 'center',
  },
});
