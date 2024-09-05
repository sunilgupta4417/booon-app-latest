import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import CustomHeader from '../../components/CustomHeader';
import {TextInput, Provider as PaperProvider} from 'react-native-paper';
import {responsiveWidth} from '../../utils';
import ButtonComp from '../../components/ButtonComp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {BASE_URL} from '../../config';
import GooglePlacesInput from '../../components/GooglePlacesInput';
import {useDispatch, useSelector} from 'react-redux';
import {AddUserAddress} from '../../redux/features/SplashSlice';
import {useFocusEffect} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
const AddAddress = ({navigation, route: {params}}) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // const {addressDetails} = params
  // console.log(addressDetails,"params");
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [landmark, setLandmark] = useState('');
  const [flat, setFlat] = useState('');
  const [selected, setSelected] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const {userAddress} = useSelector(state => state.splash);
  useEffect(() => {
    if (userAddress) {
      setAddress(userAddress?.address);
      setCity(userAddress?.city);
      setState(userAddress?.state);
      setPinCode(userAddress?.pincode);
      setLat(userAddress?.lat);
      setLng(userAddress?.lng);
    }
  }, [userAddress]);

  useEffect(() => {
    if (params?.addressDetails) {
      const {addressDetails} = params;
      console.log(addressDetails, 'adddetails');
      const {
        address,
        mobile,
        firstname,
        lastname,
        city,
        state,
        zipcode,
        add_type,
        landmark,
        buil_flat_no,
        Latitude,
        Longitude,
      } = addressDetails;
      // setName(firstname + ' ' + lastname);
      setMobile(mobile);
      setAddress(address);
      setCity(city);
      setState(state);
      setPinCode(zipcode);
      setSelected(add_type);
      setLandmark(landmark);
      setFlat(buil_flat_no);
      setLat(Latitude);
      setLng(Longitude);
    }
  }, [params?.addressDetails]);

  useFocusEffect(
    useCallback(async() => {
      const getAddressSavedList = async() => {
        const mobileNumber = JSON.parse(await AsyncStorage.getItem('userData'));
        if(mobileNumber){
          setMobile(mobileNumber.mobile)
        }
      }
      getAddressSavedList();
      // return () => {
      //   dispatch(AddUserAddress(null));
      // };
    }, [dispatch]),
  );

  const getTokenAndAddresses = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      const { id } = JSON.parse(await AsyncStorage.getItem('userData'));
      setToken(savedToken);

      if (savedToken) {
        const body = {
          user_id: id,
        };
        const headers = {
          Authorization: `Bearer ${savedToken}`,
        };
        const response = await axios.post(
          `${BASE_URL}/user-address-list`,
          body,
          { headers },
        );
        // setAddressData(response.data.data);
        dispatch({ type: 'SET_ADDRESS_LIST', payload: response.data.data });
      }
    } catch (error) {
      console.error(
        'Failed to get token from storage or fetch addresses',
        error,
      );
    }
  };

  const SaveAddress = async () => {
    const savedToken = await AsyncStorage.getItem('token');
    const id = JSON.parse(await AsyncStorage.getItem('userData'));
    const body = {
      // id: params?.addressDetails ? params?.addressDetails.id :null,
      firstname: name,
      user_id: id?.id,
      lastname: lastName,
      mobile: mobile,
      // alternate_mobile:,
      add_type: selected,
      city: city,
      state: state,
      landmark: landmark,
      address: address,
      zipcode: pinCode || '',
      latitude: lat,
      longitude: lng,
      flat_no: flat,
      primary_address: '1',
      // street_add:street,
    };
    const Sendbody = {
      // id: params?.addressDetails ? params?.addressDetails.id :null,
      firstname: name,
      user_id: id?.id,
      lastname: lastName,
      mobile: mobile,
      // alternate_mobile:,
      add_type: selected,
      city: city,
      state: state,
      landmark: landmark,
      address: address,
      zipcode: pinCode,
      Latitude: lat,
      Longitude: lng,
      flat_no: flat,
      primary_address: '1',
      // street_add:street,
    };
    // params?.addressDetails ? (body.id = params?.addressDetails.id) : null;
    console.log(body, 'bodyy', savedToken);
    const headers = {
      Authorization: `Bearer ${savedToken}`,
    };
    // console.log('YYYYYYYYYYYYYYYYYYYYYY', body);
    const response = await axios.post(`${BASE_URL}/user-address`, body, {
      headers,
    });
    console.log(response.data, 'resp');
    if (response.data.status_code == 200) {
      if (params?.from == 'cart') {
        await getTokenAndAddresses()
        params?.onAddAddress(Sendbody);
        navigation.goBack();
        return;
      }else if(params?.from == 'SelectLocation'){
        navigation.navigate('Home')
      }else{
        navigation.navigate('Address');
      }
      // dispatch(AddUserAddress(null))
      queryClient.invalidateQueries('AddAddress');
      // queryClient.invalidateQueries({
      //   queryKey: ['AddAddress'],
      //   exact: true,
      // });
    } else {
      console.error(error);
    }
  };

  const AddressType = ({title, uri, isSelected, onPress}) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.typeBtn,
        {
          borderColor: isSelected ? '#21212F' : '#DEDEE0',
          backgroundColor: isSelected ? '#1D1D2D0F' : '#FFFFFF',
        },
      ]}>
      <Image style={{height: 14, width: 14}} source={uri} />
      <Text
        style={{fontSize: 12, fontWeight: '400', fontFamily: 'Poppins-Bold'}}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}>
            <ScrollView>
              <CustomHeader title={'Add new address'} back />
              <TextInput
                label="First Name*"
                value={name}
                onChangeText={text => setName(text)}
                mode="outlined"
                style={styles.textInput}
                outlineColor="#DEDEE0"
                activeOutlineColor="#21212F"
                outlineStyle={{borderWidth: 1}}
              />

              <TextInput
                label="Last Name*"
                value={lastName}
                onChangeText={text => setLastName(text)}
                mode="outlined"
                style={styles.textInput}
                outlineColor="#DEDEE0"
                activeOutlineColor="#21212F"
                outlineStyle={{borderWidth: 1}}
              />
              <TextInput
                label="Mobile Number*"
                value={mobile}
                keyboardType="number-pad"
                onChangeText={text => setMobile(text)}
                mode="outlined"
                style={styles.textInput}
                outlineColor="#DEDEE0"
                activeOutlineColor="#21212F"
              />

              {/* <TextInput
                label="Address*"
                value={address}
                onChangeText={text => setAddress(text)}
                mode="outlined"
                style={styles.textInput}
                outlineColor='#DEDEE0'
                activeOutlineColor='#21212F'
              /> */}
              <GooglePlacesInput
                onChangeAddress={val => {
                  // console.log(val, 'valvalval============.');
                  setAddress(val);
                }}
                address={address}
              />
              <View style={[styles.row, {marginBottom: 10, marginTop: 14}]}>
                <TextInput
                  label="Pincode"
                  value={pinCode}
                  onChangeText={text => setPinCode(text)}
                  mode="outlined"
                  style={{width: '42%', backgroundColor: '#ffffff'}}
                  outlineColor="#DEDEE0"
                  activeOutlineColor="#21212F"
                />
                <TextInput
                  label="City*"
                  value={city}
                  onChangeText={text => setCity(text)}
                  mode="outlined"
                  style={{width: '42%', backgroundColor: '#ffffff'}}
                  outlineColor="#DEDEE0"
                  activeOutlineColor="#21212F"
                  editable={false}
                />
              </View>
              <TextInput
                label="State*"
                value={state}
                onChangeText={text => setState(text)}
                mode="outlined"
                style={styles.textInput}
                outlineColor="#DEDEE0"
                activeOutlineColor="#21212F"
                editable={false}
              />
              <TextInput
                label="Landmark"
                value={landmark}
                onChangeText={text => setLandmark(text)}
                mode="outlined"
                style={styles.textInput}
                outlineColor="#DEDEE0"
                activeOutlineColor="#21212F"
              />
              <TextInput
                label="Flat Number*"
                value={flat}
                onChangeText={text => setFlat(text)}
                mode="outlined"
                style={styles.textInput}
                outlineColor="#DEDEE0"
                activeOutlineColor="#21212F"
              />

              <Text style={styles.addressType}>Type of address*</Text>
              <View style={[styles.row, {marginBottom: 100}]}>
                <AddressType
                  onPress={() => setSelected('Home')}
                  title={'Home'}
                  uri={require('../../assets/homead.png')}
                  isSelected={selected === 'Home'}
                />
                <AddressType
                  onPress={() => setSelected('Office')}
                  title={'Office'}
                  uri={require('../../assets/office.png')}
                  isSelected={selected === 'Office'}
                />
                <AddressType
                  onPress={() => setSelected('Other')}
                  title={'Other'}
                  uri={require('../../assets/otherloc.png')}
                  isSelected={selected === 'Other'}
                />
              </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
              <ButtonComp
                onPress={SaveAddress}
                color={
                  name && mobile && address && selected
                    ? '#21212F'
                    : '#00000026'
                }
                bdrColor={
                  name && mobile && address && selected
                    ? '#21212F'
                    : '#00000026'
                }
                txtColor={'#FFFFFF'}
                title={'Save & Proceed'}
                width={'94%'}
                padding={4}
              />
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </PaperProvider>
  );
};

export default AddAddress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 14,
    backgroundColor: '#ffffff',
    fontFamily:'Poppins-Medium'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  addressType: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 14,
    color: '#64646D',
    margin: responsiveWidth(22),
  },
  typeBtn: {
    borderWidth: 1,
    borderRadius: 20,
    width: '26%',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: '#00000026',
    padding: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    position: 'absolute',
    bottom: 2,
    width: '100%',
  },
});
