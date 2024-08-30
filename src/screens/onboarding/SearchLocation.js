import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import CustomHeader from '../../components/CustomHeader';
import { Google_Api_Key } from '../../config';
import axios from 'axios';
import LocationIcon from '../../assets/marker.png';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config';
import locationArrow from '../../assets/location_icon.png';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import { haversineDistance } from '../../helpers/phoneValidator';
import { useQuery } from '@tanstack/react-query';
import { getAddressList } from '../../hooks/hook';
import { useSelector } from 'react-redux';
import { AddressContainer } from '../../components/AddressContainer';

const LocationModal = (props, ref) => {
  const [show, setShow] = useState(false);

  useImperativeHandle(ref, () => ({
    setShow,
  }));

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={show}
      onRequestClose={() => {
        setShow(false);
      }}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#00000070',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size={'large'} color={'white'} />
      </View>
    </Modal>
  );
};

const LocationModalRef = forwardRef(LocationModal);

const SearchLocation = ({ navigation }) => {
  const currentLatLong = useRef({});
  const inputSearchRef = useRef(null)
  const loadingRef = useRef({
    setShow: () => { },
  });
  const [suggestionLocation, setSuggestionLocation] = useState([]);
  const [currentLocation, setCurrentLocation] = useState();
  const [addListModal, setAddListModal] = useState(false);

  const { data: addressDetail, isLoading: addressLoading } = useQuery({
    queryKey: ['address'],
    queryFn: getAddressList,
  });

  const { addressList } = useSelector(state => state.Cart);

  const handleInputChange = async text => {
    if (text.length > 2) {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${Google_Api_Key}&libraries=places&language=en`;
      try {
        const response = await axios.get(url);
        setSuggestionLocation(response.data.predictions);
        console.log(JSON.stringify(response.data), 'respLo987987++++cation');
      } catch (error) {
        console.error(error);
      }
    } else {
      setSuggestionLocation([]);
    }
  };

  const getUserLocation = async () => {
    const enableResult = await promptForEnableLocationIfNeeded();
    if (enableResult == 'already-enabled' || enableResult == 'enabled') {
      Geolocation.getCurrentPosition(async position => {
        const latitude = position?.coords?.latitude;
        const longitude = position?.coords?.longitude;
        currentLatLong.current = {
          longitude,
          latitude,
        };
      });
    }
  };
  useEffect(() => {
    getUserLocation();
  }, []);

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

          return { address, city, state, postalCode };
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

  const getLatLongByPlaceId = async (place_id) => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${place_id}&key=${Google_Api_Key}`;
    try {
      const response = await axios.get(url);
      console.log(response.data.result?.geometry);

      if (response.data?.result) {
        return response.data?.result?.geometry;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);

    }
  }

  const onSelectAddress = async address => {
    try {

      let fromScreen = await AsyncStorage.getItem('fromScreen')
      let latLong = await getLatLongByPlaceId(address.place_id)
      if (latLong) {
        const lati = latLong.location.lat
        const long = latLong.location.lng
        const response = await axios.get(`${BASE_URL}/general-setting`);
        const sellerData = response?.data?.data?.supplier;
        const sellerDistance = response?.data?.data?.distance_km;

        let sellerID = [];
        let sellerNearMe = [];
        let locationDetails = {};
        const cityName = address?.terms[1].value
        const stateName = address?.terms[2].value
        locationDetails.city = cityName;
        locationDetails.state = stateName;
        locationDetails.postalCode = 'null';
        locationDetails.longitude = long;
        locationDetails.latitude = lati;
        sellerData.map(item => {
          const distance = haversineDistance(
            lati,
            long,
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
        global.sellerId = ids;
        getLocationDetails(lati, long).then(async locationDetails => {
          if (locationDetails) {
            await AsyncStorage.setItem('@login', 'true');
            locationDetails.Latitude = lati;
            locationDetails.Longitude = long;
            locationDetails.sellerId = ids;
            global.sellerId = ids
            await AsyncStorage.setItem(
              'userCurrentLocation',
              JSON.stringify(locationDetails),
            );
            setSuggestionLocation([])
            if (fromScreen == 'login') {
              await AsyncStorage.setItem('@login', 'true');
              navigation.navigate('Login');
            } else if (fromScreen == 'home') {
              await AsyncStorage.setItem('addressChange', 'true');
              navigation.navigate('HomeScreen');
            } else if (fromScreen == 'bag') {
              await AsyncStorage.setItem('addressChange', 'true');
              navigation.navigate('ProductScreen');
            }
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

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
        let fromScreen = await AsyncStorage.getItem('fromScreen')
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
            if (fromScreen == 'login') {
              await AsyncStorage.setItem('@login', 'true');
              navigation.navigate('Login');
            } else if (fromScreen == 'home') {
              await AsyncStorage.setItem('addressChange', 'true');
              navigation.navigate('HomeScreen');
            } else if (fromScreen == 'bag') {
              await AsyncStorage.setItem('addressChange', 'true');
              navigation.navigate('ProductScreen');
            }
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

  const renderAddresses = ({ item }) => (
    <AddressContainer
      onPress={async () => {
        let fromScreen = await AsyncStorage.getItem('fromScreen')
        const lati = item.Latitude
        const long = item.Longitude
        const response = await axios.get(`${BASE_URL}/general-setting`);
        const sellerData = response?.data?.data?.supplier;
        const sellerDistance = response?.data?.data?.distance_km;

        let sellerID = [];
        let sellerNearMe = [];
        let locationDetails = {};
        locationDetails.city = item.city;
        locationDetails.address = item.address;
        locationDetails.state = item.state;
        locationDetails.postalCode = item.zipcode;
        locationDetails.longitude = long;
        locationDetails.latitude = lati;
        sellerData.map(item => {
          const distance = haversineDistance(
            lati,
            long,
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
        global.sellerId = ids;
        await AsyncStorage.setItem(
          'userCurrentLocation',
          JSON.stringify(locationDetails),
        );
        if (fromScreen == 'login') {
          await AsyncStorage.setItem('@login', 'true');
          navigation.navigate('Login');
        } else if (fromScreen == 'home') {
          await AsyncStorage.setItem('addressChange', 'true');
          navigation.navigate('HomeScreen');
        } else if (fromScreen == 'bag') {
          await AsyncStorage.setItem('addressChange', 'true');
          navigation.navigate('ProductScreen');
        }
      }}
      item={item}
    />
  );

  const renderPrediction = ({ item }) => (
    <TouchableOpacity
      style={{
        paddingHorizontal: 15,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(222, 222, 224, 1)',
      }}
      onPress={() => onSelectAddress(item)}>
      <View
        style={{
          borderRadius: 30,
          height: 30,
          width: 30,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(137, 137, 163, 0.2)',
        }}>
        <Image
          source={LocationIcon}
          style={{ height: 15, width: 15, resizeMode: 'contain' }}
        />
      </View>

      <Text
        style={{
          paddingHorizontal: 10,
          fontWeight: '500',
          fontSize: 15,
        }}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LocationModalRef ref={loadingRef} />
      <CustomHeader title={'Search location to add address'} back />
      <View style={styles.txtIpBox}>
        <Image
          style={styles.SearchIcon}
          source={require('../../assets/Search.png')}
        />
        <TextInput
          ref={inputSearchRef}
          onChangeText={handleInputChange}
          placeholder="Try HSR Layout / Raj Residency / etc."
          style={styles.txtIp}
        />
      </View>

      <TouchableOpacity
        onPress={() =>
          Platform.OS == 'ios' ? getLocation() : requestLocationPermission()
        }
        style={{
          borderBottomWidth: 1,
          paddingBottom: 15,
          borderColor: 'rgba(222, 222, 224, 1)',
          marginLeft: 15,
          marginTop: 18,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Image
          source={locationArrow}
          style={{ height: 18, width: 18, resizeMode: 'contain' }}
        />
        <Text style={{ marginLeft: 8, fontSize: 15, color: 'black' }}>
          Use my current location
        </Text>
      </TouchableOpacity>
      {suggestionLocation.length == 0 && <FlatList data={addressList} renderItem={renderAddresses} />}
      <FlatList
        data={suggestionLocation}
        renderItem={renderPrediction}
        keyExtractor={item => item.place_id}
        style={{
          backgroundColor: '#fff',
          paddingTop: 20,
          marginTop: 5,
        }}
      />

    </SafeAreaView>
  );
};

export default SearchLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  txtIpBox: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 8,
    width: '95%',
    alignSelf: 'center',
    borderColor: 'grey',
    alignItems: 'center',
    borderRadius: 20,
  },
  txtIp: {
    padding: 2,
  },
  SearchIcon: {
    width: 24,
    height: 24,
    marginHorizontal: 4,
  },
});
