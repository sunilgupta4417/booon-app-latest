import {
  FlatList,
  Image,
  Platform,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import CustomHeader from '../../components/CustomHeader';
import { responsiveHeight, responsiveWidth } from '../../utils';
import ButtonComp from '../../components/ButtonComp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../../config';
import axios from 'axios';
import { useDispatch } from 'react-redux';
const width = Dimensions.get('window').width;
import { WebView } from 'react-native-webview';

const Account = ({ navigation }) => {
  const dispatch = useDispatch();
  const [userDetail, setUserDetail] = useState({});
  const [orderData, setOrderData] = useState([]);
  const [token, setToken] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tackingURL, setTrackingURL] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        const savedToken = await AsyncStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${savedToken}`,
        };
        const response = await axios.get(`${BASE_URL}/profile`, { headers });
        setToken(savedToken);
        setUserDetail(response?.data)
      };
      fetchUserData();
      getOrders();
    }, []),
  );

  const enableTrackModal = (url) => {
    setTrackingURL(url);
    setModalVisible(true);
  }

  const getOrders = async () => {
    const savedToken = await AsyncStorage.getItem('token');
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    const headers = {
      Authorization: `Bearer ${savedToken}`,
    };
    console.log("Body Data => " + JSON.stringify({
      user_id: data?.id,
      device_id: global.deviceId,
      order_type: 'new_order'
    }));
    const response = await axios.post(
      `${BASE_URL}/order-list`,
      {
        user_id: data?.id,
        device_id: global.deviceId,
        order_type: 'new_order'
      },
      {
        headers,
      },
    );
    if (response.status == 200) {
      console.log('-=-=', response?.data);
      setOrderData(response.data);
    }
  };


  const onLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('userCurrentLocation');
    await AsyncStorage.removeItem('addressChange');
    await AsyncStorage.removeItem('@login');
    dispatch({ type: 'SET_ADDRESS_LIST', payload: [] });
    setToken(null);
    navigation.navigate('GetStarted');
  };

  const renderLiveOrderItem = ({ item }) => (
    <View
      style={[
        styles.profileView,
        styles.row,
        { marginVertical: 0, borderBottomWidth: 1, borderBottomColor: '#DEDEE0' },
      ]}>
      <Image
        style={{ width: responsiveWidth(89), height: responsiveWidth(118) }}
        source={{ uri: item?.product_image }}
      />
      <View style={{ paddingLeft: 10, flexGrow: 1 }}>
        <Text style={styles.nameTxt} numberOfLines={1}>
          {item?.product_name && item.product_name.length > 20 ? item.product_name.substring(0, 20) + "..." : item?.product_name}
        </Text>
        <Text style={[styles.mobileTxt, { fontWeight: '400' }]}>
          {item?.subtitle}
        </Text>
        <View style={[styles.row, { marginBottom: 10 }]}>
          <Text style={[styles.nameTxt, { fontWeight: '400' }]}>
            Size : <Text style={{ fontWeight: '500' }}>M</Text>
          </Text>
          <Text style={[styles.nameTxt, { fontWeight: '400', marginLeft: 20 }]}>
            Qty : <Text style={{ fontWeight: '500' }}>{item?.quantity}</Text>
          </Text>
        </View>
        <Text style={[styles.nameTxt]}>
          ₹{item?.product_price}{' '}
          <Text
            style={{
              fontWeight: '400',
              color: '#64646D99',
              textDecorationLine: 'line-through',
            }}>
            {' '}
            ₹{item?.product_subtotal}{' '}
          </Text>{' '}
          <Text style={{ color: '#5EB160' }}> 40% OFF</Text>
        </Text>
        {item?.customer_tracking_url &&
          <TouchableOpacity style={{ alignSelf: 'flex-end', paddingHorizontal: 20, backgroundColor: '#000', borderRadius: 30, alignItems: 'center', paddingVertical: 10 }} onPress={() => enableTrackModal(item?.customer_tracking_url)}>
            <Text style={{ color: '#fff' }}>Track Order</Text>
          </TouchableOpacity>}
      </View>
    </View>
  );

  const NavBtn = ({ title, brdWt, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderColor: '#DEDEE0',
        borderBottomWidth: brdWt,
      }}>
      <Text style={styles.nameTxt}>{title}</Text>
      <Image
        style={{ height: 10, width: 6 }}
        source={require('../../assets/Category/rightarr.png')}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={'My Account'} search wishlist bag />
      <>
        <FlatList
          data={orderData.length > 0 ? orderData : []}
          renderItem={renderLiveOrderItem}
          ListHeaderComponent={() => (
            <>
              {userDetail?.fname && userDetail?.mobile && userDetail?.emailid ? (
                <>
                  <Text style={styles.liveOrderTxt}>Live Orders</Text>
                  <View style={styles.profileView}>
                    <Text style={styles.nameTxt}>
                      {userDetail?.fname} {userDetail?.lname}
                    </Text>
                    <View style={styles.row}>
                      <Text style={styles.mobileTxt}>{userDetail?.mobile}</Text>
                      <View style={styles.circle}></View>
                      <Text style={styles.mobileTxt}>{userDetail?.emailid}</Text>
                    </View>
                    <TouchableOpacity style={styles.editView}>
                      <Text style={styles.editTxt}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}</>
          )}
          ListFooterComponent={() => (
            <>
              {/* <View
                style={[
                  styles.profileView,
                  {
                    marginVertical: 0,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  },
                ]}>
                
              </View> */}
              <NavBtn
                onPress={() => navigation.navigate('PastOrder')}
                title="Past Orders"
              />
              {token && (
                <NavBtn
                  title="Addresses"
                  onPress={() => navigation.navigate('Address')}
                />
              )}
              <NavBtn
                onPress={() => navigation.navigate('WebViewComp', 'm-faq')}
                title="FAQ’s"
              />
              <NavBtn
                onPress={() =>
                  navigation.navigate('WebViewComp', 'm-shipping-policy')
                }
                title="Shipping & Return Policy"
              />
              <NavBtn 
                onPress={() => navigation.navigate('WebViewComp', 'm-privacy-policy')}
                title="Privacy Policy"
              />
              <NavBtn
                onPress={() => navigation.navigate('WebViewComp', 'm-about-us')}
                title="About Us"
                brdWt={1}
              />
              {token && (
                <TouchableOpacity onPress={onLogout} style={styles.logOutView}>
                  <Text style={[styles.nameTxt, { textDecorationLine: 'underline' }]}>
                    Log Out
                  </Text>
                </TouchableOpacity>
              )}</>
          )}
        />
      </>

      {/* <TouchableOpacity
        style={[
          styles.profileView,
          {
            marginVertical: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
          },
        ]}>
        <Text style={styles.nameTxt}>Past Orders</Text>
        <Image
          style={{ height: 10, width: 6 }}
          source={require('../../assets/Category/rightarr.png')}
        />
      </TouchableOpacity> */}{/* Modal */}
      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              flex: 0.8,
              backgroundColor: 'white',
              margin: 20,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 10,
                borderBottomWidth: 2,
                borderColor: 'black', // Rough border color
                borderStyle: 'dashed', // Rough border style
                backgroundColor: '#f8f8f8',
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Order Tracking</Text>
              {/* 'X' Close Button */}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  padding: 5,
                  borderColor: 'black',
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderRadius: 5,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* WebView to show the URL content */}
            <WebView
              source={{ uri: tackingURL }}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  profileView: {
    width: '90%',
    backgroundColor: '#F3F3F6B2',
    padding: 16,
    alignSelf: 'center'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameTxt: {
    fontSize: 14,
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    fontFamily: 'Poppins',
    lineHeight: 16,
    color: '#111111',
    marginRight: 20,
  },
  mobileTxt: {
    fontSize: 12,
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    fontFamily: 'Poppins',
    lineHeight: 16,
    color: '#64646D',
  },
  circle: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: '#D9D9D9',
    margin: 5,
  },
  editView: {
    // borderBottomWidth:1,
    width: responsiveWidth(26),
    height: responsiveWidth(15),
    marginVertical: 6,
  },
  editTxt: {
    fontSize: 12,
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    fontFamily: 'Poppins',
    lineHeight: 16,
    color: '#111111',
    textDecorationLine: 'underline',
  },
  liveOrderTxt: {
    fontSize: 14,
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    fontFamily: 'Poppins',
    lineHeight: 22,
    color: '#111111',
    marginLeft: 20,
    marginBottom: 10,
  },
  logOutView: {
    // borderBottomWidth:1,
    // width:responsiveWidth(60),
    // height:responsiveWidth(15),
    // marginVertical: 6,
    margin: responsiveWidth(16),
    paddingHorizontal: 8,
  },
});
