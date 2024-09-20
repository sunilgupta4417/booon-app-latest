import {
  Alert,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import {responsiveHeight, responsiveWidth} from '../../utils';
import ButtonComp from '../../components/ButtonComp';
import OTPTextInput from 'react-native-otp-textinput';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {BASE_URL} from '../../config';
import {login} from '../../redux/features/LoginSlice';
import { CommonActions } from '@react-navigation/native';

const OTPScreen = ({navigation, route: {params}}) => {
  const {data} = useSelector(state => state.Login.data);
  const [otp, setOtp] = useState('');

  const dispatch = useDispatch();
  const verifyOTP = async () => {
    if (otp == data.otp) {
      try {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.data));
        if (params?.regiration) {
          navigation.navigate('SelectLocation');
        } else {
          // navigation.navigate('HomeScreen');
          await AsyncStorage.setItem('@login', 'true');
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                {
                  name: 'HomeScreen',
                },
              ],
            })
          );
        }
      } catch (error) {
        console.error('Failed to save the token to the storage', error);
      }
    } else {
      Alert.alert('Invalid OTP', 'Please enter a valid OTP');
    }
  };

  const requestOTP = async () => {
    const body = {
      mobile: params?.mobile,
      device_id: global.deviceId,
      device_type: Platform.OS == 'android' ? 'Android' : 'IOS',
    };
    const response = await axios.post(`${BASE_URL}/login_register`, body);
    console.log(response.data, 'resp');
    if (response.data.status_code == '200') {
      dispatch(login(response));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={{width: '100%', height: responsiveHeight(230)}}
        source={require('../../assets/cover3.png')}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={{height: 32, width: 32, margin: 10}}
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
      <Text style={styles.heading}>
        To verify enter OTP sent to “{params?.mobile}”
      </Text>
      <OTPTextInput
        handleTextChange={text => setOtp(text)}
        inputCount={6} // Number of OTP inputs
        tintColor="#21212F" // Active input underline color
        offTintColor="#DEDEE0" // Inactive input underline color
        textInputStyle={{borderBottomWidth: 1, borderWidth: 1, borderRadius: 5}}
        containerStyle={{width: '100%', alignSelf: 'center', paddingHorizontal: 15}}
      />
      <ButtonComp
        onPress={verifyOTP}
        color={'#21212F'}
        title={'Continue'}
        txtColor={'#FFFFFF'}
        padding={4}
      />
      <TouchableOpacity onPress={requestOTP}>
        <Text style={styles.resendText}>Resend OTP</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default OTPScreen;

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
  resendText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter',
    width: '75%',
    alignSelf: 'center',
    textAlign: 'center',
    lineHeight: 16,
    textDecorationLine: 'underline',
    color: '#64646D',
  },
});
