import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Platform,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import ButtonComp from '../../components/ButtonComp';
import CustomHeader from '../../components/CustomHeader';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';
import { useFocusEffect } from '@react-navigation/native';

const Address = ({ navigation }) => {
  const [addressData, setAddressData] = useState([]);
  const [primaryAddress, setPrimaryAddress] = useState(false);
  const [token, setToken] = useState(null);
  const dispatch = useDispatch();

  // const { data } = useSelector((state) => ({
  //   data: state.Login.data.data
  // }))

  const getTokenAndAddresses = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      const id = JSON.parse(await AsyncStorage.getItem('userData'));
      setToken(savedToken);

      if (savedToken) {
        const body = {
          user_id: id.id,
        };
        const headers = {
          Authorization: `Bearer ${savedToken}`,
        };
        const response = await axios.post(
          `${BASE_URL}/user-address-list`,
          body,
          { headers },
        );
        if(response.data.data.length > 0){
          await AsyncStorage.setItem('addressData','true');
        }else{
          await AsyncStorage.setItem('addressData','false');
        }
        dispatch({ type: 'SET_ADDRESS_LIST', payload: response.data.data });
        setAddressData(response.data.data);

      }
    } catch (error) {
      console.error(
        'Failed to get token from storage or fetch addresses',
        error,
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      getTokenAndAddresses();
    }, []),
  );
  // userCurrentLocation
  const editAddress = item => {
    navigation.navigate('AddAddress', {
      from: 'Addresses',
      addressDetails: item,
    });
  };
  const removeAddress = async id => {
    console.log(id, 'iddd', token);
    if (token) {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.get(`${BASE_URL}/delete-address/${id}`, {
        headers,
      });
      console.log(response.data, 'removeResp');
      if (response.data) {
        getTokenAndAddresses();
      }
    }
  };

  const _setPrimaryAddress = (address) => {
    console.log(address);
    
    // setPrimaryAddress()
  }
  const renderAddresses = ({ item }) => (
    <View style={styles.AddressView}>
      <View style={{flexDirection:'row',alignItems:'flex-start'}}>
        <View style={{flexGrow:1}}>
          {item.firstname && (
            <Text style={styles.nameTxt}>
              {item.firstname + ' ' + item.lastname}
            </Text>
          )}
          <Text style={styles.addressTxt}>
            {item.buil_flat_no} {item.address}
          </Text>
          <Text style={styles.addressTxt}>
            {item.state} - {item.zipcode}
          </Text>
          <Text style={[styles.addressTxt, { marginVertical: 10 }]}>
            Mobile: {item.mobile}
          </Text>
        </View>
        {/* <View>
          <CheckBox
            value={primaryAddress}
            onValueChange={()=>_setPrimaryAddress(item)}
            boxType="square"
            onAnimationType="fade"
            offAnimationType="fade"
            onCheckColor="grey"
            onTintColor="grey"
            style={{ height: 25, width: 25 }}
          />
        </View> */}
      </View>
      <View style={styles.row}>
        <ButtonComp
          onPress={() => editAddress(item)}
          title={'Edit'}
          txtColor={'#21212F'}
          bdrColor={'#DEDEE0'}
          width={'48%'}
          padding={2}
        />
        <ButtonComp
          onPress={() => removeAddress(item?.id)}
          title={'Remove'}
          txtColor={'#21212F'}
          bdrColor={'#DEDEE0'}
          width={'48%'}
          padding={2}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={'Addresses'} back />
      <TouchableOpacity
        onPress={() => navigation.navigate('AddAddress')}
        style={styles.AddBtnView}>
        <Text style={styles.nameTxt}>+ Add new address</Text>
      </TouchableOpacity>
      {addressData.length !== 0 && (
        <FlatList data={addressData} renderItem={renderAddresses} />
      )}
    </SafeAreaView>
  );
};

export default Address;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  AddBtnView: {
    borderWidth: 1,
    borderRadius: 20,
    width: '88%',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  AddressView: {
    backgroundColor: '#F3F3F6B2',
    padding: 14,
    width: '90%',
    alignSelf: 'center',
    margin: 16,
  },
  nameTxt: {
    fontSize: 14,
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    fontFamily: 'Poppins',
    lineHeight: 16,
    color: '#111111',
  },
  addressTxt: {
    fontSize: 12,
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    fontFamily: 'Poppins',
    lineHeight: 16,
    color: '#64646D',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
