import {
  Alert,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { responsiveHeight, responsiveWidth } from '../../utils';
import ButtonComp from '../../components/ButtonComp';
import axios from 'axios';
import { BASE_URL } from '../../config';
// import DeviceInfo from 'react-native-device-info'
import phoneValidator from '../../helpers/phoneValidator';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/features/LoginSlice';

const Login = ({ navigation, route }) => {
  const [num, setNum] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [deviceType, setDeviceType] = useState('');
  // regiration
  const dispatch = useDispatch();

  useEffect(() => {
    // Get device ID and device type
    const fetchDeviceInfo = async () => {
      // const id = await DeviceInfo.getUniqueId()
      // const type = DeviceInfo.getDeviceType()
      // setDeviceId(id)
      // setDeviceType(type)
    };

    fetchDeviceInfo();
  }, []);

  const requestOTP = async () => {
    // console.log(deviceId,deviceType)
    const body = {
      mobile: num,
      device_id: global.deviceId,
      device_type: Platform.OS == 'android' ? 'Android' : 'IOS',
    };
    const phoneError = phoneValidator(num);
    console.log(body, 'phoneError');
    if (phoneError) {
      Alert.alert(phoneError);
      return false
    }

    try {
      const response = await axios.post(`${BASE_URL}/login_register`, body);
      console.log(response.data, 'resp');
      if (response.data.status_code == '200') {
        dispatch(login(response));
        navigation.navigate('OTPScreen', { mobile: num, regiration: route.params?.regiration });
      }
    } catch (error) {
      Alert.alert(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={{ width: '100%', height: responsiveHeight(230) }}
        source={require('../../assets/cover3.png')}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={{ height: 32, width: 32, margin: 10 }}
            source={require('../../assets/backW.png')}
          />
        </TouchableOpacity>
        <Image
          style={{
            width: responsiveWidth(320),
            height: responsiveWidth(76),
            alignSelf: 'center',
            marginTop: responsiveHeight(60),
          }}
          source={require('../../assets/booonLogo.png')}
        />
      </ImageBackground>
      <Text style={styles.heading}>Verify your mobile number to proceed</Text>
      <View style={styles.inputView}>
        <View
          style={{
            borderRightWidth: 1,
            borderColor: '#DEDEE0',
            padding: 2,
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: '#000000',
              fontSize: 14,
              fontWeight: '400',
              fontFamily: 'Poppins',
            }}>
            +91
          </Text>
        </View>
        <TextInput
          value={num}
          onChangeText={setNum}
          style={{
            width: '90%',
            paddingLeft: 8,
            padding: 1,
            fontSize: 14,
            fontWeight: '400',
            fontFamily: 'Poppins',
            color: '#000000',
          }}
          keyboardType="phone-pad"
        />
      </View>
      <ButtonComp
        onPress={requestOTP}
        color={'#21212F'}
        title={'Request for OTP'}
        txtColor={'#FFFFFF'}
        padding={4}
      />
      <Text
        style={{
          color: '#64646D',
          fontSize: 12,
          fontWeight: '400',
          fontFamily: 'Inter',
          width: '75%',
          alignSelf: 'center',
          textAlign: 'center',
          lineHeight: 16,
        }}>
        By clicking. I accept the terms of{' '}
        <Text style={{ textDecorationLine: 'underline' }}>
          service and privacy policy.
        </Text>
      </Text>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heading: {
    fontSize: 16,
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    fontFamily: 'Poppins',
    lineHeight: 24,
    color: '#111111',
    width: '60%',
    margin: 20,
  },
  inputView: {
    borderWidth: 1,
    borderColor: '#DEDEE0',
    borderRadius: 4,
    width: '90%',
    alignSelf: 'center',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
});
