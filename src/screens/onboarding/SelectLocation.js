import {
  Alert,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import ButtonComp from '../../components/ButtonComp';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Google_Api_Key} from '../../config';
import axios from 'axios';
import {BASE_URL} from '../../config';
import {haversineDistance} from '../../helpers/phoneValidator';

const {width} = Dimensions.get('window');

const SelectLocation = ({navigation}) => {
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getLocation();
      } else {
        Alert.alert('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getLocationDetails = async (latitude, longitude) => {
    const apiKey = Google_Api_Key; // Replace with your API key
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      if (response.data.status === 'OK') {
        const results = response.data.results;
        if (results.length > 0) {
          const addressComponents = results[0].address_components;
          const address = results[0].formatted_address;

          let city = '';
          let state = '';
          let postalCode = '';

          addressComponents.forEach(component => {
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (component.types.includes('postal_code')) {
              postalCode = component.long_name;
            }
          });

          return {address, city, state, postalCode};
        }
      } else {
        console.error(
          'Geocode was not successful for the following reason:',
          response.data.status,
        );
        return null;
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
      return null;
    }
  };

  const getLocation = async () => {
    const response = await axios.get(`${BASE_URL}/general-setting`);
    const sellerData = response?.data?.data?.supplier;
    const sellerDistance = response?.data?.data?.distance_km;
    Geolocation.getCurrentPosition(
      async position => {
        let sellerNearMe = [];
        let sellerID = [];
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        sellerData.map(item => {
          const distance = haversineDistance(
            latitude,
            longitude,
            item?.Latitude,
            item?.Longitude,
          );
          if (distance <= sellerDistance) {
            sellerNearMe.push(item?.id);
          }
        });
        let ids = '';

        if (sellerNearMe.length == 0) {
          ids = sellerID.join(',');
        } else {
          ids = sellerNearMe.join(',');
        }

        getLocationDetails(latitude, longitude).then(async locationDetails => {
          if (locationDetails) {
            await AsyncStorage.setItem('@login', 'true');
            locationDetails.Latitude = latitude;
            locationDetails.Longitude = longitude;
            locationDetails.sellerId = ids;
            global.sellerId = ids 
            await AsyncStorage.setItem(
              'userCurrentLocation',
              JSON.stringify(locationDetails),
            );
            navigation.navigate('Login');

          }
        });
      },
      error => {
        console.log(error, 'err');
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <Image source={require('../../assets/map.png')} style={styles.mapImg} />
        <LinearGradient
          style={styles.gradientOverlay}
          colors={['transparent', '#ffffff']} // Gradient from transparent to white
        />
        <View
          style={{
            height: 172,
            width: 172,
            borderRadius: 86,
            alignSelf: 'center',
            borderWidth: 0,
            position: 'absolute',
            bottom: 80,
            justifyContent: 'center',
            backgroundColor: 'rgba(80,80,80,0.1)',
          }}>
          <Image
            source={require('../../assets/pointer.png')}
            style={styles.pointerImg}
          />
        </View>
      </View>
      <Text style={styles.title}>Where should we deliver?</Text>
      <Text style={[styles.title, {marginBottom: 30}]}>
        Your styles will arrive within 2 hours!
      </Text>
      <ButtonComp
        title={'At my current location'}
        color={'black'}
        txtColor={'white'}
        onPress={() =>
          Platform.OS == 'ios' ? getLocation() : requestLocationPermission()
        }
      />
      <ButtonComp
        title={'I’ll enter my location manually'}
        bdrColor={'#000000'}
        color={'white'}
        txtColor={'#111111'}
        onPress={async() => {await AsyncStorage.setItem('fromScreen','login');navigation.navigate('SearchLocation')}}
      />
    </SafeAreaView>
  );
};

export default SelectLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  mapContainer: {
    width: width,
    height: 460,
    position: 'relative',
  },
  mapImg: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    bottom: 0,
  },
  pointerImg: {
    width: 42,
    height: 48,
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    padding: 2,
    fontFamily: 'Poppins',
    lineHeight: 24,
    color: '#111111',
  },
});
