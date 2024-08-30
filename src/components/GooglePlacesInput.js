import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList} from 'react-native';
import axios from 'axios';
import {Google_Api_Key} from '../config';
import {TextInput} from 'react-native-paper';
import {AddUserAddress} from '../redux/features/SplashSlice';
import {useDispatch} from 'react-redux';
import {responsiveHeight} from '../utils';

const GooglePlacesInput = ({address, onChangeAddress}) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const apiKey = Google_Api_Key;

  useEffect(() => {
    setQuery(address);
  }, [address]);

  const handleInputChange = async text => {
    setQuery(text);
    if (onChangeAddress) {
      onChangeAddress(text);
    }
    if (text.length > 2) {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${apiKey}&types=geocode&language=en`;
      try {
        const response = await axios.get(url);
        setPredictions(response.data.predictions);
        console.log(response.data, 'respLocation');
      } catch (error) {
        console.error(error);
      }
    } else {
      setPredictions([]);
    }
  };

  const handleSelectPrediction = async prediction => {
    // dispatch(AddUserAddress({address:prediction.description}))
    setQuery(prediction.description);
    setPredictions([]);
    const placeDetails = await fetchPlaceDetails(prediction.place_id);
    setSelectedPlace(placeDetails);
    const {city, state, pincode, lat, lng} = placeDetails;

    if (onChangeAddress) {
      onChangeAddress(prediction.description);
    }
    dispatch(
      AddUserAddress({
        address: prediction.description,
        city: city,
        state: state,
        pincode: pincode,
        lat: lat,
        lng: lng,
      }),
    );
  };
  console.log(selectedPlace, 'selectedPlace');
  const fetchPlaceDetails = async placeId => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
    try {
      const response = await axios.get(url);
      const {address_components, geometry} = response.data.result;

      let city = '';
      let state = '';
      let pincode = '';
      address_components.forEach(component => {
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('postal_code')) {
          pincode = component.long_name;
        }
      });

      const {lat, lng} = geometry.location;

      // dispatch(AddUserAddress({city:city,state:state,pincode:pincode,lat:lat,lng:lng}))
      return {city, state, pincode, lat, lng};
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const renderPrediction = ({item}) => (
    <TouchableOpacity onPress={() => handleSelectPrediction(item)}>
      <Text style={styles.predictionText}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        label="Address*"
        value={query}
        onChangeText={handleInputChange}
        mode="outlined"
        style={styles.textInput}
        outlineColor="#DEDEE0"
        activeOutlineColor="#21212F"
      />
      {predictions.length > 0 && (
        <FlatList
          data={predictions}
          renderItem={renderPrediction}
          keyExtractor={item => item.place_id}
          style={styles.predictionContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // margin: 20,
  },
  textInput: {
    width: '90%',
    alignSelf: 'center',
    height: responsiveHeight(50),
    // marginBottom: 14,
    backgroundColor: '#ffffff',
  },
  predictionContainer: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 5,
    width: '90%',
    alignSelf: 'center',
  },
  predictionText: {
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
});

export default GooglePlacesInput;
