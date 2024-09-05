import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomHeader from '../../components/CustomHeader';
import { getDistanceFromLatLonInKm, responsiveWidth } from '../../utils';
import ButtonComp from '../../components/ButtonComp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../config';
import CheckBox from '@react-native-community/checkbox';
import DeviceInfo from 'react-native-device-info';
import { useQuery } from '@tanstack/react-query';
import { getAddressList } from '../../hooks/hook';
import { AddressContainer } from '../../components/AddressContainer';
import { useSelector } from 'react-redux';
import { haversineDistance } from '../../helpers/phoneValidator';

const BagScreen = ({ navigation }) => {
  const [cartData, setCartData] = useState([]);
  const [removeModal, setRemoveModal] = useState(false);
  const [payModeModal, setPayModeModal] = useState(false);
  const [modalData, setModalData] = useState();
  const [totalSP, setTotalSP] = useState();
  const [currentLocation, setCurrentLocation] = useState();
  const [selected, setSelected] = useState(0);
  const [sizeModal, setSizeModal] = useState(false);
  const [qtyModal, setQtyModal] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedQty, setSelectedQty] = useState([]);
  const [couponList, setCouponList] = useState([]);
  const [txtCoupon, setCouponValue] = useState('');
  const [isProceed, setisProceed] = useState(false)
  const [isAddressGet, setisAddressGet] = useState(false)
  const [NoLocation, setNoLocation] = useState(false)
  const [discountValue, setDiscountValue] = useState(0);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [chargesList, setChargesList] = useState([]);
  const [sizesList, setSizesList] = useState([]);
  const [totalCartDetail, setTotalCartDetail] = useState({});
  const [loading, setLoading] = useState(true);
  const [UserCurrentAddress, setUserCurrentAddress] = useState(null)
  const [addressChange, setaddressChange] = useState('false')
  const [addListModal, setAddListModal] = useState(false);
  const grandTotal = totalSP - discountValue + shippingCharges;
  const { addressList } = useSelector(state => state.Cart);
  const [DeleiveryTime,setDeleiveryTime] = useState('')
  const [AddressLists, setAddressLists] = useState(addressList)

  useEffect(() => {
    getCartData();
    getUserAddress();
    getCouponCodeList();
    getShippingCharges()
    // _getUserCurrentLocation()
  }, []);

  const getUserAddress = async () => {
    const userLocation = JSON.parse(
      await AsyncStorage.getItem('userCurrentLocation'),
    );
    const addressChanged = await AsyncStorage.getItem('addressChange');
    console.log('-=-=addressChanged-=-=', userLocation);

    setaddressChange(addressChanged)
    setCurrentLocation(userLocation);
    setUserCurrentAddress(userLocation);
  };

  const removeProduct = async () => {
    const savedToken = await AsyncStorage.getItem('token');
    const { id } = JSON.parse(await AsyncStorage.getItem('userData'));
    const headers = {
      Authorization: `Bearer ${savedToken}`,
    };
    const body = {
      user_id: id,
      device_id: global.deviceId,
      id: modalData.id,
      action: 1,
    };
    const response = await axios.post(`${BASE_URL}/cart-item-action`, body, {
      headers,
    });
    console.log(response.data, 'removeResp');
    if (response.data.status_code == 200) {
      getCartData();
      setRemoveModal(false);
    }
  };

  const updateProductQty = async () => {
    const savedToken = await AsyncStorage.getItem('token');
    const { id } = JSON.parse(await AsyncStorage.getItem('userData'));
    const headers = {
      Authorization: `Bearer ${savedToken}`,
    };
    const body = {
      user_id: id,
      device_id: global.deviceId,
      id: modalData.id,
      action: 0,
      qty: selectedQty[0],
      options: JSON.parse(modalData?.options),
    };
    const response = await axios.post(`${BASE_URL}/cart-item-action`, body, {
      headers,
    });
    console.log(response.data, 'removeResp');
    if (response.data.status_code == 200) {
      getCartData();
      setQtyModal(false);
    }
  };

  const updateProductSize = async () => {
    const savedToken = await AsyncStorage.getItem('token');
    const { id } = JSON.parse(await AsyncStorage.getItem('userData'));
    const headers = {
      Authorization: `Bearer ${savedToken}`,
    };
    const body = {
      user_id: id,
      device_id: global.deviceId,
      id: modalData.id,
      action: 0,
      qty: modalData?.quantity,
      options: {
        ...JSON.parse(modalData?.options),
        Size: selectedSizes?.name,
        EAN: selectedSizes?.size_ean_no,
      },
    };
    const response = await axios.post(`${BASE_URL}/cart-item-action`, body, {
      headers,
    });
    console.log(response.data, 'update size data');
    if (response.data.status_code == 200) {
      setSelectedSizes({});
      getCartData();
      setSizeModal(false);
    }
  };

  const getCartData = async () => {
    const savedToken = await AsyncStorage.getItem('token');
    const { id } = JSON.parse(await AsyncStorage.getItem('userData'));
    if (savedToken) {
      const headers = {
        Authorization: `Bearer ${savedToken}`,
      };
      const body = {
        user_id: id,
        device_id: global.deviceId,
      };
      const response = await axios.post(`${BASE_URL}/cart-list`, body, {
        headers,
      });
      console.log(response.data.data, 'getCartData');
      if (response.data.status_code == 200) {
        setCartData(response.data.data);
        let Data = response.data.data;
        const totalSellPrice = Data.reduce(
          (total, item) => total + parseFloat(item.sellprice) * item.quantity,
          0,
        );
        const uniqueSellers = {};
        Data.forEach(item => {
          if (!uniqueSellers[item?.seller_id]) {
            uniqueSellers[item?.seller_id] = item?.ShippingCharge;
          }
        });

        const result = Object.keys(uniqueSellers).map(key => ({
          seller_id: Number(key),
          ShippingCharge: uniqueSellers[key],
        }));

        const totalShippingCharge = result.reduce(
          (sum, item) => sum + item.ShippingCharge,
          0,
        );
        setTotalCartDetail(response.data);
        setShippingCharges(totalShippingCharge);
        setTotalSP(totalSellPrice);
        setLoading(false);
      }
    } else {
      return;
    }
  };

  const getCouponCodeList = async () => {
    const savedToken = await AsyncStorage.getItem('token');
    if (savedToken) {
      const headers = {
        Authorization: `Bearer ${savedToken}`,
      };
      const response = await axios.get(`${BASE_URL}/all-coupon`, { headers });
      // console.log(response.data,'coupon data')
      if (response.data.status_code == 200 && response.data.status == true) {
        setCouponList(response.data?.data || []);
      } else {
        setCouponList([]);
      }
    } else {
      return;
    }
  };

  const getShippingCharges = async () => {
    const response = await axios.get(`${BASE_URL}/shipping-charges`);
    if (Array.isArray(response.data)) {
      setChargesList(response.data);
    } else {
      setChargesList([]);
    }
  };

  const openRemoveModal = item => {
    setRemoveModal(true);
    setModalData(item);
  };

  const renderLiveOrderItem = ({ item }) => {
    setDeleiveryTime(getDistanceFromLatLonInKm(
      {
        latitude: currentLocation?.Latitude,
        longitude: currentLocation?.Longitude,
      },
      { latitude: item?.Latitude, longitude: item?.Longitude },
      {
        startTime: item?.workinng_start_time,
        endTime: item?.workinng_end_time,
      },
    ))
    return (
      <View style={[styles.profileView, styles.row]}>
        <Image
          style={{ width: responsiveWidth(89), height: responsiveWidth(118) }}
          source={{ uri: item.product_image }}
        />
        <View style={{ padding: 10, borderWidth: 0, width: '70%' }}>
          <Text style={styles.nameTxt}>{item.brandname}</Text>
          <Text style={[styles.mobileTxt, { fontWeight: '400' }]}>
            {item.shortdescription}
          </Text>
          <View
            style={[
              styles.row,
              { marginVertical: 8, justifyContent: 'space-between', width: '60%' },
            ]}>
            <TouchableOpacity
              style={[
                styles.row,
                {
                  borderWidth: 1,
                  borderColor: '#DEDEE0',
                  borderRadius: 20,
                  padding: 6,
                  marginRight: 5,
                },
              ]}
              onPress={() => {
                setSizeModal(true);
                setSizesList(item?.product_size);
                setModalData(item);
              }}>
              <Text style={[styles.nameTxt, { fontWeight: '400' }]}>
                Size :{' '}
                <Text style={{ fontWeight: '500' }}>
                  {JSON.parse(item.options)?.Size}
                </Text>
              </Text>
              <Image
                style={{ height: 6, width: 10, margin: 4 }}
                source={require('../../assets/Home/down.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalData(item);
                setQtyModal(true);
                setSelectedQty([item?.quantity]);
              }}
              style={[
                styles.row,
                {
                  borderWidth: 1,
                  borderColor: '#DEDEE0',
                  borderRadius: 20,
                  padding: 6,
                },
              ]}>
              <Text style={[styles.nameTxt, { fontWeight: '400' }]}>
                Qty : <Text style={{ fontWeight: '500' }}>{item?.quantity}</Text>
              </Text>
              <Image
                style={{ height: 6, width: 10, margin: 4 }}
                source={require('../../assets/Home/down.png')}
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.nameTxt, { marginTop: 0 }]}>
            ₹{item.sellprice}
            <Text
              style={{
                fontWeight: '400',
                color: '#64646D99',
                textDecorationLine: 'line-through',
              }}>
              {' '}
              ₹{parseInt(item.costprice)}{' '}
            </Text>{' '}
            <Text style={{ color: '#5EB160' }}>
              {' '}
              {((item.sellprice / item.costprice) * 100).toFixed()}% OFF
            </Text>
          </Text>
          <Text style={{ fontWeight: '400', color: '#64646D99' }}>
            {getDistanceFromLatLonInKm(
              {
                latitude: currentLocation?.Latitude,
                longitude: currentLocation?.Longitude,
              },
              { latitude: item?.Latitude, longitude: item?.Longitude },
              {
                startTime: item?.workinng_start_time,
                endTime: item?.workinng_end_time,
              },
            )}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => openRemoveModal(item)}
          style={{ alignSelf: 'flex-start', marginTop: 10 }}>
          <Image
            style={{ height: 20, width: 20 }}
            source={require('../../assets/remove.png')}
          />
        </TouchableOpacity>
      </View>
    )
  }

  const ServiceComp = ({ uri, txt }) => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 98,
        borderWidth: 0,
      }}>
      <Image style={{ width: 43, height: 39, margin: 15 }} source={uri} />
      <Text
        numberOfLines={2}
        style={{
          fontSize: 12,
          fontWeight: '400',
          alignSelf: 'center',
          textAlign: 'center',
          lineHeight: 16,
          fontFamily: 'Inter',
          color: '#111111',
        }}>
        {txt}
      </Text>
    </View>
  );

  const toggleSize = size => {
    setSelectedSizes([size]);
  };

  const onPressRemove = () => {
    setDiscountValue(0);
    setCouponValue('');
  };

  const onPressApply = () => {
    const checkIsExist = couponList?.filter(i => i.disc_code === txtCoupon);
    if (checkIsExist.length > 0) {
      const couponData = checkIsExist[0];
      const startDate = new Date(couponData?.validfrom);
      const endDate = new Date(couponData?.validto);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkIsExpired = today >= startDate && today <= endDate;
      if (checkIsExpired) {
        if (totalSP > couponData?.MinimumOrder) {
          setDiscountValue(couponData?.discountvalue);
          Alert.alert('Success', `Coupon applied successfully.`);
        } else {
          Alert.alert(
            'Alert',
            'minimum order value is ' + couponData?.MinimumOrder,
          );
          setDiscountValue(0);
        }
      } else {
        Alert.alert('Coupon not valid', 'Coupon is expired');
        setDiscountValue(0);
      }
      return;
    } else {
      Alert.alert('Coupon not valid', 'Entered coupon is not valid');
      setDiscountValue(0);
    }
  };

  const CreateOrderButton = () => {
    const onPressPlaceOrder = async () => {
      setLoading(true);
      // {{BASE_URL}}/profile
      const savedToken = await AsyncStorage.getItem('token');
      const userLocation = JSON.parse(
        await AsyncStorage.getItem('userCurrentLocation'),
      );
      const headers = {
        Authorization: `Bearer ${savedToken}`,
      };
      const response = await axios.get(`${BASE_URL}/profile`, { headers });
      const id = await DeviceInfo.getUniqueId();
      const { fname, mobile, lname, id: userId } = response.data;
      const order = totalCartDetail?.data || [];
      let subtotal = 0;
      let orderTotal = 0;
      order.map(item => {
        subtotal = subtotal + item?.sellprice * item?.quantity;

        orderTotal =
          orderTotal + item?.sellprice * item?.quantity + item?.ShippingCharge;
      });

      const typePayment = selected == 0 ? '2' : '1';

      const myHeaders = new Headers();
      // myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
      myHeaders.append('Authorization', `Bearer ${savedToken}`);

      const urlencoded = new FormData();
      urlencoded.append('user_id', userId);
      // urlencoded.append('device_id', id);
      urlencoded.append('device_id', global.deviceId);
      urlencoded.append('first_name', fname);
      urlencoded.append('last_name', lname);
      urlencoded.append('address', userLocation.address);
      urlencoded.append('landmark', userLocation.landmark || '');
      urlencoded.append('city', userLocation.city);
      urlencoded.append('state', userLocation.state);
      urlencoded.append('zipcode', userLocation.zipcode);
      urlencoded.append('country', userLocation.city);
      urlencoded.append('shipping_charge', shippingCharges);
      urlencoded.append('order_subtotal', subtotal);
      urlencoded.append('order_totals', orderTotal);
      urlencoded.append('order_status', typePayment);
      // order_status
      urlencoded.append('payment_mode', selected);
      urlencoded.append('txt_status', '');
      urlencoded.append('cs_latitude', userLocation.Latitude);
      urlencoded.append('cs_longitude', userLocation.Longitude);
      urlencoded.append('shipping_buil_flat_no', userLocation.address);
      urlencoded.append('shipping_street_add', userLocation.address);
      urlencoded.append('mobile', mobile);
      // urlencoded.append('user_id', '178');
      // urlencoded.append('device_id', global.deviceId);

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow',
      };

      fetch(BASE_URL + '/create-order', requestOptions)
        .then(response => response.json())
        .then(result => {
          if (selected === 1) {
            let urlencoded = new FormData();
            urlencoded.append('order_id', result?.order_ids[0]);
            urlencoded.append('amount', orderTotal);
            const requestOptions = {
              method: 'POST',
              headers: myHeaders,
              body: urlencoded,
              redirect: 'follow',
            };

            fetch('https://api.booon.in/api/ccavenue-order', requestOptions)
              .then(response => response.json())
              .then(result => {
                navigation.navigate('WebViewPage', { response: result });
              })
              .catch(error => console.error(error));
            setLoading(false);
          } else {
            if (result) {
              navigation.replace('OrderSuccess', {
                payload: urlencoded,
                orderResponse: result,
                DeleiveryTime:DeleiveryTime
              });
            } else {
              Alert.alert('Something went wrong');
            }
            setLoading(false);
          }
        })
        .catch(error => {
          console.error(error);
          setLoading(false);
        });
    };
    return (
      <ButtonComp
        loading={loading}
        onPress={() => {
          onPressPlaceOrder();
        }}
        title={totalSP ? `Place Order for ₹${grandTotal}` : 'Place Order'}
        imgStyle={{ width: 14, height: 14, marginRight: 5 }}
        width={'90%'}
        color={'#111111'}
        txtColor={'#FFFFFF'}
      />
    );
  };

  const AddressDelivery = () => {
    const { data: addressData, isLoading } = useQuery({
      queryKey: ['address'],
      queryFn: getAddressList,
    });

    let buttonLabel = ``;

    if (addressData?.data?.length == 0 || addressData?.data == null) {
      buttonLabel = UserCurrentAddress.address;
    } else {
      buttonLabel = `${addressChange == 'false' ? addressData?.data[0]?.add_type + ', ' + addressData?.data[0]?.address : UserCurrentAddress.address}`;
    }

    return (
      <TouchableOpacity
      // disabled={isLoading}
      //  onPress={getUserAddressDetail}
      >
        <Text
          style={{
            fontSize: 12,
            // fontWeight: '400',
            fontFamily: 'Poppins-Medium',
            color: '#000000',
          }}>
          <Text style={{
            fontSize: 12,
            // fontWeight: '400',
            fontFamily: 'Poppins-SemiBold',
            color: '#000000',
          }}>Deliver to : </Text>
          {buttonLabel}
        </Text>
      </TouchableOpacity>
    );
  };

  const OrderPlacePopup = () => {
    const { data: addressData, isLoading } = useQuery({
      queryKey: ['address'],
      queryFn: getAddressList,
    });
    let buttonLabel = '';

    if (addressData?.data?.length == 0 || addressData?.data == null) {
      buttonLabel = 'Add Address';
    } else {
      buttonLabel = 'Select Address';
    }
    const onPlaceOrder = async () => {
      if (addressData?.data?.length == 0 || addressData?.data == null) {
        let detail = await AsyncStorage.getItem('userCurrentLocation');
        const savedToken = await AsyncStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${savedToken}`,
        };
        const response = await axios.get(`${BASE_URL}/profile`, { headers });

        if (detail == null) {
          detail = {};
        } else {
          detail = JSON.parse(detail);
        }

        let payload = {
          address: '',
          mobile: '',
          firstname: '',
          lastname: '',
          city: '',
          state: '',
          zipcode: '',
          add_type: '',
          landmark: '',
          buil_flat_no: '',
          Latitude: '',
          Longitude: '',
        };

        if (response?.data?.mobile) {
          payload.mobile = response?.data?.mobile;
        }

        if (response.data?.fname) {
          payload.firstname = response.data?.fname;
        }

        payload.city = detail?.city;
        payload.state = detail?.state;
        payload.zipcode = detail?.zipcode;
        payload.Latitude = detail?.Latitude;
        payload.Longitude = detail?.Longitude;
        payload.address = detail?.address;

        navigation.navigate('AddAddress', {
          from: 'cart',
          addressDetails: payload,
          onAddAddress: async (val) => {
            await AsyncStorage.setItem('userCurrentLocation', JSON.stringify(val));
            setAddressLists(prevData => [
              ...prevData,
              val,
            ])
            setisAddressGet(true)
          },
        });
      } else {
        setAddListModal(true)
      }
    };
    return (
      <ButtonComp
        onPress={onPlaceOrder}
        title={buttonLabel}
        imgStyle={{ width: 14, height: 14, marginRight: 5 }}
        width={'90%'}
        color={'#111111'}
        txtColor={'#FFFFFF'}
      />
    );
  };

  const addAddressModal = async () => {
    setAddListModal(false)
    let detail = await AsyncStorage.getItem('userCurrentLocation');
    if (detail == null) {
      detail = {};
    } else {
      detail = JSON.parse(detail);
    }

    let payload = {
      address: '',
      mobile: '',
      firstname: '',
      lastname: '',
      city: '',
      state: '',
      zipcode: '',
      add_type: '',
      landmark: '',
      buil_flat_no: '',
      Latitude: '',
      Longitude: '',
    };
    payload.city = detail?.city;
    payload.state = detail?.state;
    payload.zipcode = detail?.zipcode;
    payload.Latitude = detail?.Latitude;
    payload.Longitude = detail?.Longitude;
    payload.address = detail?.address;
    navigation.navigate('AddAddress', {
      from: 'cart',
      addressDetails: payload,
      onAddAddress: async (val) => {
        await AsyncStorage.setItem('userCurrentLocation', JSON.stringify(val));
        setAddressLists(prevData => [
          ...prevData,
          val,
        ])
        setisAddressGet(true)
      },
    });
  }

  const renderAddresses = ({ item }) => (
    <AddressContainer
      onPress={async () => {
        setNoLocation(false)
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
        locationDetails.zipcode = item.zipcode;
        locationDetails.add_type = item.add_type
        locationDetails.Longitude = long;
        locationDetails.Latitude = lati;
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
        if (ids == '' || ids == undefined) {
          setNoLocation(true)
          setAddListModal(false)
          return;
        }

        global.sellerId = ids;
        await AsyncStorage.setItem(
          'userCurrentLocation',
          JSON.stringify(locationDetails),
        );
        await AsyncStorage.setItem(
          'addressChange',
          'true',
        );
        await getUserAddress()
        setAddListModal(false);
        setisProceed(true)
      }}
      item={item}
    />
  );

  useEffect(() => {
    const setCuuL = async () => {
      const userLocation = JSON.parse(
        await AsyncStorage.getItem('userCurrentLocation'),
      );
      setCurrentLocation(userLocation);
      setUserCurrentAddress(userLocation)
    }
    setCuuL()
  }, [isProceed])

  const OrderProceedBtn = () => {
    return (
      <ButtonComp
        onPress={() => setPayModeModal(true)}
        title={totalSP ? `Place Order for ₹${grandTotal}` : 'Place Order'}
        imgStyle={{ width: 14, height: 14, marginRight: 5 }}
        width={'90%'}
        color={'#111111'}
        txtColor={'#FFFFFF'}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {cartData.length > 0 ? (
        <>
          <CustomHeader
            back
            title={`Bag (${cartData?.length > 0 && cartData?.length <= 9
              ? '0' + cartData?.length
              : cartData?.length
              })`}
          />
          <ScrollView>
            <View>
              <FlatList data={cartData} renderItem={renderLiveOrderItem} />
            </View>
            <View style={[styles.row, { margin: 16 }]}>
              <TextInput
                placeholder="Enter Coupon Code"
                placeholderTextColor={'#000000'}
                style={styles.couponTextbox}
                value={txtCoupon}
                onChangeText={setCouponValue}
              />
              <ButtonComp
                title={'Apply'}
                color={'#21212F'}
                txtColor={'#FFFFFF'}
                width={'34%'}
                padding={4}
                onPress={() => {
                  onPressApply();
                }}
              />
            </View>
            <View
              style={{ backgroundColor: '#F3F3F6B2', margin: 16, padding: 16 }}>
              <Text style={styles.nameTxt}>
                Price Details ({cartData?.length} Items)
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginVertical: 10,
                }}>
                <Text style={styles.font12}>Sub Total</Text>
                <Text style={styles.font12}>₹{totalSP}</Text>
              </View>
              {discountValue > 0 ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <View>
                    <Text style={styles.font12}>Coupon Discount</Text>
                    <Text style={[styles.font12, { color: '#64646D99' }]}>
                      {`(${txtCoupon})`}{' '}
                      <Text onPress={() => onPressRemove()}>Remove</Text>
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: '500',
                      color: '#16A34A',
                    }}>
                    - ₹{discountValue}
                  </Text>
                </View>
              ) : null}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderColor: '#DEDEE0',
                }}>
                <Text style={styles.font12}>Shipping Fee</Text>
                <Text
                  style={{
                    fontFamily: 'Inter',
                    fontSize: 12,
                    fontWeight: '500',
                    color: '#16A34A',
                  }}>
                  ₹{20}
                  {/* shippingCharges */}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 16,
                }}>
                <Text style={styles.font12}>Payable Amount</Text>
                <Text
                  style={{ fontSize: 12, fontWeight: 'bold', color: '#000000' }}>
                  ₹{grandTotal}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: '95%',
                justifyContent: 'space-evenly',
                borderWidth: 0,
                alignSelf: 'center',
                marginBottom: 15,
              }}>
              <ServiceComp
                txt={'24 hrs to return, no questions'}
                uri={require('../../assets/Home/clock.png')}
              />
              <ServiceComp
                txt={'Cash on Delivery Available'}
                uri={require('../../assets/Home/cash.png')}
              />
              <ServiceComp
                txt={'Free Shipping Above ₹500'}
                uri={require('../../assets/Home/delivery.png')}
              />
            </View>
          </ScrollView>
          <View
            style={{
              alignItems: 'center',
              paddingTop: 10,
              borderTopWidth: 1,
              width: '100%',
              borderColor: '#DEDEE0',
              backgroundColor: '#FFFFFF',
            }}>
            {NoLocation ? <View><Text style={{ color: '#333', fontFamily: 'Poppins-Medium' }}>No Delivery at your Location</Text></View> : <AddressDelivery />}

            {isProceed ? <OrderProceedBtn /> : <OrderPlacePopup />}
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={removeModal}
            onRequestClose={() => {
              setRemoveModal(!removeModal);
            }}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    onPress={() => setRemoveModal(false)}
                    style={{
                      color: '#000000',
                      fontSize: 16,
                      fontWeight: '500',
                      fontFamily: 'Poppins',
                      marginRight: 20,
                    }}>
                    X
                  </Text>
                  <Text
                    style={{
                      color: '#000000',
                      fontSize: 16,
                      fontWeight: '500',
                      fontFamily: 'Poppins',
                    }}>
                    Remove From Bag ?
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 0,
                    width: '75%',
                    marginVertical: 16,
                  }}>
                  <Image
                    style={{ height: 94, width: 78, marginRight: 8 }}
                    source={{ uri: modalData?.product_image }}
                  />
                  <Text
                    style={{
                      color: '#000000',
                      fontSize: 12,
                      fontWeight: '500',
                      fontFamily: 'Poppins',
                      marginRight: 20,
                    }}>
                    Are you sure you want to remove this item? Alternatively,
                    you can move it to your wishlist for later.
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <ButtonComp
                    title={'Move to Wishlist'}
                    bdrColor={'#DEDEE0'}
                    txtColor={'#21212F'}
                    width={'45%'}
                    padding={2}
                  />
                  <ButtonComp
                    onPress={removeProduct}
                    title={'Yes, Remove'}
                    color={'#21212F'}
                    txtColor={'#FFFFFF'}
                    width={'45%'}
                    padding={2}
                  />
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={payModeModal}
            onRequestClose={() => {
              setPayModeModal(!payModeModal);
            }}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 15,
                  }}>
                  <TouchableOpacity onPress={() => setPayModeModal(false)}>
                    <Image
                      style={{ height: 25, width: 25 }}
                      source={require('../../assets/back2.png')}
                    />
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#333',
                      fontFamily: 'Poppins-SemiBold',
                    }}>
                    Choose your payment mode
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelected(0)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    width: '90%',
                    borderColor: selected == 0 ? '#000000' : '#00000033',
                    borderWidth: 1,
                    padding: 10,
                    alignSelf: 'center',
                    marginBottom: 15,
                  }}>
                  <View
                    style={{
                      height: 30,
                      width: 30,
                      borderRadius: 15,
                      borderWidth: 1,
                      borderColor: selected == 0 ? '#000000' : '#00000033',
                      backgroundColor: selected == 0 ? '#000000' : '#FFFFFF',
                    }}></View>
                  <View>
                    <Text style={{ fontFamily: 'Poppins-Medium', color: '#333' }}>Pay on delivery</Text>
                    <Text style={{ fontFamily: 'Poppins-Regular', color: '#999' }}>Cash or UPI to the delivery partner</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelected(1)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    width: '90%',
                    borderColor: selected == 1 ? '#000000' : '#00000033',
                    borderWidth: 1,
                    padding: 10,
                    alignSelf: 'center',
                    marginBottom: 15,
                  }}>
                  <View
                    style={{
                      height: 30,
                      width: 30,
                      borderRadius: 15,
                      borderWidth: 1,
                      borderColor: selected == 1 ? '#000000' : '#00000033',
                      backgroundColor: selected == 1 ? '#000000' : '#FFFFFF',
                    }}></View>
                  <View>
                    <Text style={{ fontFamily: 'Poppins-Medium', color: '#333' }}>Pay now online</Text>
                    <Text style={{ fontFamily: 'Poppins-Regular', color: '#999' }}>Credit/Debit Card, Netbanking, UPI</Text>
                  </View>
                </TouchableOpacity>
                <CreateOrderButton />
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={qtyModal}
            onRequestClose={() => {
              setQtyModal(!qtyModal);
            }}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setQtyModal(false)}>
                    <Image
                      style={styles.modalClose}
                      source={require('../../assets/cross.png')}
                    />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Qty</Text>
                </View>
                <ScrollView style={styles.modalOptions}>
                  {['1', '2', '3', '4', '5'].map(size => (
                    <View key={size} style={styles.option}>
                      <CheckBox
                        value={selectedQty.includes(size)}
                        onValueChange={() => setSelectedQty([size])}
                        boxType="square"
                        onAnimationType="fade"
                        offAnimationType="fade"
                        onCheckColor="grey"
                        onTintColor="grey"
                        style={{ height: 25, width: 25 }}
                      />
                      <Text
                        style={{
                          marginLeft: 16,
                          color: '#64646D',
                          fontSize: 14,
                          fontWeight: '400',
                          fontFamily: 'Poppins',
                        }}>
                        {size}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                      setSelectedSizes([]);
                      setQtyModal(false);
                    }}>
                    <Text style={styles.clearButtonText}>{'Cancel'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => {
                      updateProductQty();
                    }}>
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={sizeModal}
            onRequestClose={() => {
              setSizeModal(!sizeModal);
            }}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setSizeModal(false)}>
                    <Image
                      style={styles.modalClose}
                      source={require('../../assets/cross.png')}
                    />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Size</Text>
                </View>
                <ScrollView style={styles.modalOptions}>
                  {sizesList.map(size => (
                    <View
                      key={size}
                      style={[
                        styles.option,
                        { opacity: size?.qty == 0 ? 0.5 : 1 },
                      ]}>
                      <CheckBox
                        value={selectedSizes?.name == size?.name}
                        onValueChange={() => setSelectedSizes(size)}
                        boxType="square"
                        onAnimationType="fade"
                        offAnimationType="fade"
                        onCheckColor={'grey'}
                        onTintColor={'grey'}
                        style={{ height: 25, width: 25 }}
                        disabled={size?.qty == 0}
                      />
                      <Text
                        style={{
                          marginLeft: 16,
                          color: '#64646D',
                          fontSize: 14,
                          fontWeight: '400',
                          fontFamily: 'Poppins',
                        }}>
                        {size?.name}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                      setSizeModal(false);
                      setSelectedSizes({});
                    }}>
                    <Text style={styles.clearButtonText}>{'Cancel'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => updateProductSize()}>
                    <Text style={styles.applyButtonText}>{'Apply'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={addListModal}
            onRequestClose={() => {
              setAddListModal(!addListModal);
            }}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    // margin: 5,
                    marginBottom: 10
                  }}>
                  <Text style={{ fontSize: 18, fontFamily: 'Poppins-SemiBold', color: '#000' }}>
                    Select Address
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAddListModal(false)}>
                    <Image
                      style={styles.modalClose}
                      source={require('../../assets/cross.png')}
                    />
                  </TouchableOpacity>
                </View>
                <FlatList data={AddressLists} renderItem={renderAddresses} />
                <ButtonComp
                  onPress={addAddressModal}
                  title={'Add Address'}
                  imgStyle={{ width: 14, height: 14, marginRight: 5 }}
                  width={'40%'}
                  color={'#111111'}
                  txtColor={'#FFFFFF'}
                />
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <>
          <CustomHeader
            back
            title={`Bag (${cartData?.length > 0 && cartData?.length <= 9
              ? '0' + cartData?.length
              : cartData?.length
              })`}
          />

          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {loading ? (
              <ActivityIndicator size={'small'} color={'#333'} />
            ) : (
              <Text>No Data</Text>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default BagScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileView: {
    width: '90%',
    marginHorizontal: 20,
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
  },
  mobileTxt: {
    fontSize: 12,
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    fontFamily: 'Poppins',
    lineHeight: 16,
    color: '#64646D',
  },
  font12: {
    fontSize: 12,
    fontFamily: 'Poppins',
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    // maxHeight: responsiveWidth(400),
    minHeight: responsiveWidth(200),
    // paddingBottom: 5,
    // alignItems: 'center',
  },
  modalClose: {
    marginLeft: 10,
    height: 32,
    width: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: Platform.OS === 'android' ? '700' : '500',
    margin: 16,
    marginLeft: 8,
    color: '#000000',
  },
  modalOptions: {
    width: '100%',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  clearButton: {
    paddingVertical: 12,
    borderColor: '#DEDEE0',
    borderWidth: 1,
    borderRadius: 20,
    width: '48%',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#111111',
  },
  applyButton: {
    paddingVertical: 12,
    backgroundColor: '#111111',
    borderRadius: 20,
    width: '48%',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#DEDEE0',
  },
  couponTextbox: {
    // height:40,
    // paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#DEDEE0',
    borderRadius: 20,
    width: '65%',
    padding: 8,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Poppins',
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    color: '#000000',
  },
});
