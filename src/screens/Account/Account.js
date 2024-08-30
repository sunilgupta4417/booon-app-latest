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
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import CustomHeader from '../../components/CustomHeader';
import {responsiveHeight, responsiveWidth} from '../../utils';
import ButtonComp from '../../components/ButtonComp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {BASE_URL} from '../../config';
import axios from 'axios';

const width = Dimensions.get('window').width;
const Account = ({navigation}) => {
  const [userDetail, setUserDetail] = useState({});
  const [orderData, setOrderData] = useState([]);
  const [token, setToken] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        const savedToken = await AsyncStorage.getItem('token');

        const headers = {
          Authorization: `Bearer ${savedToken}`,
        };
        const response = await axios.get(`${BASE_URL}/profile`, {headers});
        setToken(savedToken);
        console.log(response.data, 'toresponseresponseken');
      };

      fetchUserData();
    }, []),
  );

  const getOrders = async () => {
    // {{BASE_URL}}/order-list
    const savedToken = await AsyncStorage.getItem('token');
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    // setUserDetail(data)
    console.log(data + '', '235908734029849204');
    const headers = {
      Authorization: `Bearer ${savedToken}`,
    };
    const response = await axios.post(
      `${BASE_URL}/order-list`,
      {
        user_id: data?.id + '',
        device_id: global.deviceId,
      },
      {
        headers,
      },
    );
    if (response.status == 200) {
      setOrderData(response.data);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const onLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('userCurrentLocation');
    await AsyncStorage.removeItem('addressChange');
    setToken(null);
    navigation.navigate('GetStarted');
  };
  const LiveOrderData = [
    {
      img: require('../../assets/order1.png'),
      title: 'Tokyo Talkies',
      subtitle: 'Women Pink Solid Fitted Top',
    },
    {
      img: require('../../assets/order1.png'),
      title: 'Tokyo Talkies',
      subtitle: 'Women Pink Solid Fitted Top',
    },
  ];
  const renderLiveOrderItem = ({item}) => (
    <View
      style={[
        styles.profileView,
        styles.row,
        {marginVertical: 0, borderBottomWidth: 1, borderBottomColor: '#DEDEE0'},
      ]}>
      {console.log(item, 'item============>0000000---------')}
      <Image
        style={{width: responsiveWidth(89), height: responsiveWidth(118)}}
        source={{uri: item?.product_image}}
      />
      <View style={{padding: 10}}>
        <Text style={styles.nameTxt} numberOfLines={1}>
          {item.product_name}
        </Text>
        <Text style={[styles.mobileTxt, {fontWeight: '400'}]}>
          {item.subtitle}
        </Text>
        <View style={styles.row}>
          <Text style={[styles.nameTxt, {fontWeight: '400'}]}>
            Size : <Text style={{fontWeight: '500'}}>M</Text>
          </Text>
          <Text style={[styles.nameTxt, {fontWeight: '400', marginLeft: 20}]}>
            Qty : <Text style={{fontWeight: '500'}}>{item?.quantity}</Text>
          </Text>
        </View>
        <Text style={[styles.nameTxt, {}]}>
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
          <Text style={{color: '#5EB160'}}> 40% OFF</Text>
        </Text>
      </View>
    </View>
  );

  const NavBtn = ({title, brdWt, onPress}) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderColor: '#DEDEE0',
        borderBottomWidth: brdWt,
      }}>
      <Text style={styles.nameTxt}>{title}</Text>
      <Image
        style={{height: 10, width: 6}}
        source={require('../../assets/Category/rightarr.png')}
      />
    </TouchableOpacity>
  );

  console.log(orderData[orderData.length - 1], 'orderDataorderDataorderData00');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <CustomHeader title={'My Account'} search wishlist bag />
        {userDetail?.fname && userDetail?.mobile && userDetail?.emailid ? (
          <>
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
        ) : null}

        {orderData[orderData.length - 1]?.order_detail?.length > 0 ? (
          <>
            <Text style={styles.liveOrderTxt}>Live Orders</Text>
            <FlatList
              data={orderData[orderData.length - 1]?.order_detail}
              renderItem={renderLiveOrderItem}
            />
            <View
              style={[
                styles.profileView,
                {
                  marginVertical: 0,
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                },
              ]}>
              <ButtonComp
                width={'48%'}
                title={'Cancel Order'}
                txtColor={'#21212F'}
                padding={1}
                bdrColor={'#DEDEE0'}
              />
              <ButtonComp
                width={'48%'}
                title={'Track Order'}
                padding={1}
                color={'#21212F'}
                txtColor={'#FFFFFF'}
              />
            </View>
          </>
        ) : null}

        <TouchableOpacity
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
            style={{height: 10, width: 6}}
            source={require('../../assets/Category/rightarr.png')}
          />
        </TouchableOpacity>
        {token && (
          <NavBtn
            title="Addresses"
            onPress={() => navigation.navigate('Address')}
          />
        )}

        {/* //     {{BASE_URL}}/cms-page/m-about-us
    // {{BASE_URL}}/cms-page/m-faq
    // {{BASE_URL}}/cms-page/m-privacy-policy
    // {{BASE_URL}}/cms-page/m-shipping-policy */}
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
            <Text style={[styles.nameTxt, {textDecorationLine: 'underline'}]}>
              Log Out
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    // height: responsiveHeight(98),
    backgroundColor: '#F3F3F6B2',
    margin: 20,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameTxt: {
    fontSize: 14,
    width: width - 240,

    fontWeight: Platform.OS == 'android' ? '700' : '500',
    fontFamily: 'Poppins',
    lineHeight: 16,
    color: '#111111',
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
