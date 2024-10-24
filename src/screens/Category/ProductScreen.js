import {
  Platform,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {
  getDistanceFromLatLonInKm,
  responsiveHeight,
  responsiveWidth,
} from '../../utils';
import ButtonComp from '../../components/ButtonComp';
import Accordion from 'react-native-collapsible/Accordion';
import CustomHeader from '../../components/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {BASE_URL} from '../../config';
import CarouselComp from '../../components/CarouselComp';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {AddressContainer} from '../../components/AddressContainer';
import {useDispatch} from 'react-redux';
const {width: viewportWidth, height} = Dimensions.get('window');
import {useQuery} from '@tanstack/react-query';
import {getAddressList} from '../../hooks/hook';

function haversineDistance(lat1, lon1, lat2, lon2) {
  // Convert degrees to radians
  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Radius of the Earth in kilometers
  const R = 6371;

  // Difference in coordinates
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  // Convert latitude to radians
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(radLat1) *
      Math.cos(radLat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in kilometers
  const distance = R * c;

  return distance;
}

const ProductScreen = ({navigation, route: {params}}) => {
  const {data: addressDetail, isLoading: addressLoading} = useQuery({
    queryKey: ['address'],
    queryFn: getAddressList,
  });

  const dispatch = useDispatch();
  const {addressList} = useSelector(state => state.Cart);
  const SECTIONS = [
    {
      title: 'Product Details',
    },
  ];
  const [activeSections, setActiveSections] = useState([]);
  const [token, setToken] = useState(null);
  const [wishListData, setWishListData] = useState(null);
  const [filterData, setFilterData] = useState();
  const [filterCartData, setFilterCartData] = useState();
  const [isBag, setIsBag] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [productDetail, setProductDetail] = useState(null);
  const [feature, setFeature] = useState();
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [page, setPage] = useState(1);
  const [curr, setCurr] = useState(null)
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [imageBase, setImageBase] = useState('');
  const [sizeModal, setSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [currentLocation, setCurrentLocation] = useState();
  const [addListModal, setAddListModal] = useState(false);
  const [addressChange, setaddressChange] = useState('false')


  // useEffect(() => {
  //   getWishListData();
  // }, [isFav]);

  useFocusEffect(
    useCallback(async() => {
      // getCartData();
      getProductDetail();
      _getUserCurrentLocation();
    }, []),
  );

  const _getUserCurrentLocation = async() => {
    const userCurrentLocation = await AsyncStorage.getItem('userCurrentLocation');
    setCurr(JSON.parse(userCurrentLocation))
    const addressChanged = await AsyncStorage.getItem('addressChange');
    setaddressChange(addressChanged)
  }

  useEffect(() => {
   
    // getSimilarProd(1)
    getUserAddress();
  }, []);

  const getUserAddress = async () => {
    const userLocation = JSON.parse(
      await AsyncStorage.getItem('userCurrentLocation'),
    );
    setCurrentLocation(userLocation);
  };

  const getProductDetail = async () => {
    const {id} = JSON.parse(await AsyncStorage.getItem('userData'));
    const response = await axios.get(
      `${BASE_URL}/product-detail/${params?.wishlist ? params?.item?.product_id : params?.item?.id}?user_id=${id}&device_id=${global.deviceId}`,
    );
    setProductDetail(response.data);
    setIsFav(response.data?.is_wishlist)
    setIsBag(response.data?.is_bag)
    setFeature(JSON.parse(response.data.product?.feature));
    // setImageBase(response.data.images_url);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMoreData) {
      setPage(prevPage => {
        const newPage = prevPage + 1;
        getSimilarProd(newPage);
        return newPage;
      });
    }
  };

  const getSimilarProd = async pageNum => {
    if (isLoading || !hasMoreData) return;
    setIsLoading(true);

    const body = {
      page: pageNum,
      // ...(params.item.tags && {tags: params.item.tags}),
      ...(params.item.cat_id && {cat_id: params.item.cat_id}),
      ...(params.item.subcat_id !== null && {subcat_id: params.item.subcat_id}),
      ...(params.item.subsubcat_id !== null && {
        subsubcat_id: params.item.subsubcat_id,
      }),
      // ...(params.item.brandname !== null && { brandname: params.item.brandname }),
    };
    const response = await axios.post(
      `${BASE_URL}/product-list?seller_id=${global.sellerId}`,
      body,
    );
    if (response.status === 200) {
      setImageBase(global.imageThumbPath);
      if (response.data.product.data.length > 0) {
        setSubCategoryData(prevData => [
          ...prevData,
          ...response.data.product.data,
        ]);
      } else {
        setHasMoreData(false);
      }
    }
    setIsLoading(false);
  };

  // const getWishListData = async () => {
  //   const savedToken = await AsyncStorage.getItem('token');
  //   const {id} = JSON.parse(await AsyncStorage.getItem('userData'));
  //   if (savedToken) {
  //     const headers = {
  //       Authorization: `Bearer ${savedToken}`,
  //     };
  //     const body = {
  //       user_id: id,
  //       device_id: global.deviceId,
  //     };
  //     const response = await axios.post(`${BASE_URL}/wish-list`, body, {
  //       headers,
  //     });
  //     if (response.data.status_code == 200) {
  //       setWishListData(response.data.data);
  //       const filteredData = response.data.data.filter(
  //         item => item.product_id == params?.item?.id,
  //       );
  //       setFilterData(filteredData[0]);
  //       if (filteredData?.length > 0) {
  //         setIsFav(true);
  //       }
  //     }
  //   } else {
  //     return;
  //   }
  // };
  // const getCartData = async () => {
  //   const savedToken = await AsyncStorage.getItem('token');
  //   const {id} = JSON.parse(await AsyncStorage.getItem('userData'));
  //   if (savedToken) {
  //     const headers = {
  //       Authorization: `Bearer ${savedToken}`,
  //     };
  //     const body = {
  //       user_id: id,
  //       device_id: global.deviceId,
  //     };
  //     // console.log(body,'83weiru928743woer')
  //     const response = await axios.post(`${BASE_URL}/cart-list`, body, {
  //       headers,
  //     });
  //     console.log(response.data, 'getCartData');
  //     if (response.data.status_code == 200) {
  //       // setWishListData(response.data.data)
  //       const filteredData = response.data.data.filter(
  //         item => item?.product_id == params?.item?.id,
  //       );

  //       console.log(filteredData, 'filteredDatafilteredDatafilteredData');
  //       setFilterCartData(filteredData);
  //       console.log(filteredData, 'fil987987redCart', response.data.data);
  //       // if (filteredData?.length > 0) {
  //       //   setIsFav(true)
  //       // }
  //     } else {
  //     }
  //   } else {
  //     return;
  //   }
  // };

  const updateWishList = async () => {
    const savedToken = await AsyncStorage.getItem('token');
    const {id} = JSON.parse(await AsyncStorage.getItem('userData'));
    if (savedToken) {
      const headers = {
        Authorization: `Bearer ${savedToken}`,
      };
      const body = {
        ...(isFav && {id: productDetail?.wishlist_id > 0 && productDetail?.wishlist_id}),
        ...(!isFav && {product_id: params.item?.id}),
        user_id: id,
        device_id: global.deviceId,
      };
      // console.log(body,'body');
      const response = await axios.post(
        `${BASE_URL}/add-remove-wish-list`,
        body,
        {headers},
      );
      if (response.data.status_code == 200) {
        getCount()
        setIsFav(!isFav)
        // dispatch({ type: 'BAG_COUNT', payload: {wish_list_count:wishListData.length - 1} });
      }
    } else {
      navigation.navigate('Login');
    }
  };

  const getCount = async () => {
    const {id} = JSON.parse(await AsyncStorage.getItem('userData'));
    const body = {
      user_id: id,
      device_id: global.deviceId,
    };
    const response = await axios.post(`${BASE_URL}/counting`, body);
    dispatch({type: 'BAG_COUNT', payload: response.data});
  };

  const addToBag = async () => {
    try {
      if (selectedSize) {
        const savedToken = await AsyncStorage.getItem('token');
        setToken(savedToken);
        if (savedToken) {
          // console.log('test : ', filterCartData?.length);
          if (isBag) {
            navigation.navigate('BagScreen');
          } else {
            // const savedToken = await AsyncStorage.getItem('token')
            const {id} = JSON.parse(await AsyncStorage.getItem('userData'));
            // if (savedToken) {
            const headers = {
              Authorization: `Bearer ${savedToken}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            };
            const body = {
              user_id: id,
              device_id: global.deviceId,
              product_id: params?.item?.id,
              product_image: `${imageBase}/${params?.item?.seller_id}/${params?.item?.image}`,
              qty: 1,
              options: {
                Color: 'Black',
                Size: selectedSize?.name,
                SKU: productDetail?.product?.sku,
                EAN: selectedSize?.size_ean_no,
                Fabric: productDetail?.product?.fabric,
              },
              distance: 25,
              shipping_charge: 10,
            };
            // console.log(body, 'bodyAddCart');
            const response = await axios.post(`${BASE_URL}/add-in-cart`, body, {
              headers,
            });
            if (response.data.status_code == 200) {
              getCount();
              setIsBag(true)
              // getCartData();
            }

            // alert(JSON.stringify(body))
          }
        } else {
          navigation.navigate('Login');
        }
      } else {
        Alert.alert('Please Select Size');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const renderItem2 = ({ item }) => (
  //   <ImageBackground source={{ uri: `${productDetail.images_url}/${productDetail.product.seller_id}/${item.image}` }} style={styles.carouselItem}>
  //   </ImageBackground>
  // );
  //
  const renderSubCategory = ({item}) => (
    <TouchableOpacity
      onPress={() => navigation.push('ProductScreen', {item: item})}
      style={{marginRight: 5, marginLeft: 8}}>
      <Image
        style={{width: responsiveWidth(190), height: responsiveWidth(240)}}
        source={{uri: `${imageBase}${item.seller_id}/${item.image}`}}
      />
      <View style={{width: responsiveWidth(190), padding: 5}}>
        <Text style={styles.itemName}>{item.brandname}</Text>
        <Text style={styles.subtitle}>{item.name}</Text>
        <View style={{flexDirection: 'row', width: '84%'}}>
          <Text style={styles.itemName}>₹{parseInt(item.sellprice)}</Text>
          <Text style={[styles.subtitle, {textDecorationLine: 'line-through'}]}>
            {' '}
            ₹{parseInt(item.costprice)}
          </Text>
          <Text style={styles.subtitle}> ₹{item.discount} Off</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ServiceComp = ({uri, txt}) => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 98,
        borderWidth: 0,
      }}>
      <Image style={{width: 43, height: 39, margin: 15}} source={uri} />
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

  const _renderHeader = (section, index, isActive) => {
    return (
      <View
        key={index}
        style={{backgroundColor: '#F3F3F6', padding: 10, marginTop: 10}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: Platform.OS == 'android' ? '700' : '500',
              fontFamily: 'Poppins',
              color: '#111111',
            }}>
            {section.title}
          </Text>
          {isActive ? (
            <Image
              style={{height: 5, width: 10}}
              source={require('../../assets/upB.png')}
            />
          ) : (
            <Image
              style={{height: 6, width: 10}}
              source={require('../../assets/Home/down.png')}
            />
          )}
        </View>
      </View>
    );
  };

  const _renderContent = () => {
    const renderDetails = ({item}) => {
      return (
        <View style={{backgroundColor: '#F3F3F6', padding: 10}}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              fontFamily: 'Poppins',
              color: '#111111',
            }}>
            {Object.keys(item) == 'vendorArticleNumber'
              ? 'Vendor Article Number'
              : 'Vendor Article Name'}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '400',
              fontFamily: 'Poppins',
              color: '#111111',
            }}>
            {Object.values(item)}
          </Text>
        </View>
      );
    };
    return (
      <View>
        <FlatList data={feature} renderItem={renderDetails} />
      </View>
    );
  };

  const _updateSections = activeSections => {
    setActiveSections(activeSections);
  };

  const renderAddresses = ({item}) => (
    <AddressContainer
      onPress={async () => {
        setCurrentLocation(item);
        setAddListModal(false);
      }}
      item={item}
    />
  );

  let productSize = productDetail?.product_size || [];

  const order = ['S', 'M', 'L', 'XL','XXL'];

  productSize.sort((a, b) => {
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  const hourCalculate = distance => {
    if (distance > 0 && distance <= 12) {
      return 2;
    }

    if (distance >= 12 && distance <= 20) {
      return 3;
    }

    return 4;
  };

  // if(currentLocation?.Latitude)

  // console.log(
  //   haversineDistance(
  //     currentLocation?.Latitude,
  //     currentLocation?.Longitude,
  //     productDetail?.product?.Latitude,
  //     productDetail?.product?.Longitude,
  //   ),
  //   '99ffffffffffffs223',
  // );

  const distanceHours = hourCalculate(
    haversineDistance(
      currentLocation?.Latitude,
      currentLocation?.Longitude,
      productDetail?.product?.Latitude,
      productDetail?.product?.Longitude,
    ),
  );

  // console.log(distanceHours, 'UUUUUUUUUUUIIIIIIOP');

  // {
  //   latitude: currentLocation?.Latitude,
  //   longitude: currentLocation?.Longitude,
  // },
  // {
  //   latitude: productDetail?.product?.Latitude,
  //   longitude: productDetail?.product?.Longitude,
  // },
  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader back search wishlist bag />
      {productDetail ? (
        <>
          <FlatList
            data={subCategoryData}
            renderItem={renderSubCategory}
            numColumns={2}
            style={{borderWidth: 0}}
            keyExtractor={(item, index) => index + ''}
            ListHeaderComponent={() => (
              <>
                <CarouselComp productDetail={productDetail} />
                <View style={{padding: 10, marginBottom: 0}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: Platform.OS == 'android' ? '700' : '500',
                      fontFamily: 'Poppins',
                      marginBottom: 5,
                      color: '#111111',
                    }}>
                    {productDetail?.product.brandname}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '400',
                      fontFamily: 'Poppins',
                      color: '#64646D',
                    }}>
                    {productDetail?.product.shortdescription}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginVertical: 5,
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'Poppins',
                        fontWeight: Platform.OS == 'android' ? '700' : '500',
                        marginRight: 5,
                        color: '#111111',
                      }}>
                      ₹{parseInt(productDetail?.product.sellprice)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'Poppins',
                        fontWeight: '400',
                        color: '#64646D',
                        textDecorationLine: 'line-through',
                        marginRight: 5,
                      }}>
                      ₹{parseInt(productDetail?.product.costprice)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: 'Inter',
                        fontWeight: Platform.OS == 'android' ? '700' : '500',
                        marginRight: 5,
                        color: '#FFFFFF',
                        backgroundColor: '#5EB160',
                        padding: 2,
                      }}>
                      {productDetail?.product.discount}% OFF
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginVertical: 16,
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: Platform.OS == 'android' ? '700' : '500',
                        color: '#111111',
                      }}>
                      Select Size
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSizeModal(true)}
                      style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Image
                        style={{height: 20, width: 20, marginRight: 5}}
                        source={require('../../assets/measuring.png')}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: 'bold',
                          fontFamily: 'Poppins',
                          color: '#000000',
                          textDecorationLine: 'underline',
                        }}>
                        Size Chart
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{flexDirection: 'row', marginBottom: 16}}>
                    {productSize.map(item => (
                      <TouchableOpacity
                        onPress={() => setSelectedSize(item)}
                        disabled={item?.qty == 0}
                        style={{
                          borderWidth: 1,
                          borderRadius: 5,
                          paddingVertical: 10,
                          position:'relative',
                          width: responsiveWidth(50),
                          alignItems: 'center',
                          marginRight: 15,
                          backgroundColor:
                            selectedSize.name == item.name
                              ? '#5EB160'
                              : 'transparent',
                          borderColor:
                            item?.qty == 0
                              ? 'lightgray'
                              : selectedSize.name == item.name
                              ? 'white'
                              : 'grey',
                        }}>
                          { item?.qty == 0 && <View style={styles.cutLine}></View>}
                        <Text
                          style={{
                            color:
                              item?.qty == 0
                                ? 'lightgray'
                                : selectedSize.name == item.name
                                ? 'white'
                                : '#111111',
                            fontSize: 12,
                            fontWeight: '400',
                            fontFamily: 'Poppins',
                          }}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View
                    style={{
                      backgroundColor: '#F3F3F6',
                      padding: 20,
                      flexDirection: 'row',
                    }}>
                    <View
                      style={{
                        height: 32,
                        width: 32,
                        borderRadius: 16,
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
                      }}>
                      <Image
                        style={{height: 14, width: 10}}
                        source={require('../../assets/marker.png')}
                      />
                    </View>
                    <View style={{flexGrow:1}}>
                      <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity
                          // onPress={async() => {await AsyncStorage.setItem('fromScreen','bag');navigation.navigate('SearchLocation')}}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 0,
                            width: '96%',
                          }}>
                          <Text style={[styles.headerTitle,{width:'100%'}]} numberOfLines={1}>
                            Delivery to{' '}
                            <Text style={{fontWeight: 'bold'}}>
                              {addressChange == 'false' ? addressDetail?.data?.length > 0
                                && addressDetail?.data[0]?.address
                                : curr?.address}
                            </Text>
                          </Text>
                          {/* {console.log(
                            currentLocation,
                            'currentLocation349873493443348',
                          )} */}
                          {/* <Image style={{ height: 6, width: 10, margin: 4 }} source={require('../../assets/Home/down.png')} /> */}
                        </TouchableOpacity>
                      </View>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '400',
                          fontFamily: 'Poppins',
                          color: '#64646D',
                        }}>
                        {getDistanceFromLatLonInKm(
                          {
                            latitude: currentLocation?.Latitude,
                            longitude: currentLocation?.Longitude,
                          },
                          {
                            latitude: productDetail?.product?.Latitude,
                            longitude: productDetail?.product?.Longitude,
                          },
                          {
                            startTime:
                              productDetail?.product?.workinng_start_time,
                            endTime: productDetail?.product?.workinng_end_time,
                          },
                        )}
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
                      marginVertical: 15,
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
                  <Accordion
                    sections={SECTIONS}
                    activeSections={activeSections}
                    renderHeader={_renderHeader}
                    renderContent={_renderContent}
                    onChange={_updateSections}
                    underlayColor="transparent" // Ensure underlay color is transparent
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: Platform.OS == 'android' ? '700' : '500',
                      fontFamily: 'Poppins',
                      lineHeight: 22,
                      marginVertical: 10,
                      color: '#111111',
                    }}>
                    Similar Products
                  </Text>
                </View>
              </>
            )}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoading && <ActivityIndicator size="large" color="#0000ff" />
            }
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              borderTopWidth: 1,
              width: '100%',
              borderColor: '#DEDEE0',
              backgroundColor: '#FFFFFF',
            }}>
            <ButtonComp
              onPress={updateWishList}
              title={isFav ? 'Wishlisted' : 'Wishlist'}
              img={
                isFav
                  ? require('../../assets/fav.png')
                  : require('../../assets/Wishlist1.png')
              }
              imgStyle={{
                width: isFav ? 18 : 28,
                height: isFav ? 15 : 28,
                marginRight: 5,
              }}
              width={'45%'}
              color={'#FFFFFF'}
              txtColor={'#111111'}
              bdrColor={'#DEDEE0'}
            />
            <ButtonComp
              onPress={() => addToBag()}
              title={isBag ? 'Go to Bag' : 'Add to Bag'}
              img={require('../../assets/bagW.png')}
              imgStyle={{width: 14, height: 14, marginRight: 5}}
              width={'45%'}
              color={'#111111'}
              txtColor={'#FFFFFF'}
            />
          </View>
        </>
      ) : (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sizeModal}
        onRequestClose={() => {
          setSizeModal(!sizeModal);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text
              onPress={() => setSizeModal(false)}
              style={{alignSelf: 'flex-end'}}>
              X
            </Text>
            <Image
              style={{height: 100, width: '100%'}}
              source={{uri: productDetail?.size_chart}}
            />
          </View>
        </View>
      </Modal>

      {/* Address Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addListModal}
        onRequestClose={() => {
          setAddListModal(!addListModal);
        }}>
        <View style={styles.addressModalOverlay}>
          <View style={styles.addressModalContainer}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 5,
              }}>
              <Text style={[styles.headerTitle, {fontSize: 16}]}>
                Select Delivery Address
              </Text>
              <Text
                style={{alignSelf: 'flex-end'}}
                onPress={() => setAddListModal(false)}>
                X
              </Text>
            </View>
            <FlatList data={addressList} renderItem={renderAddresses} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  paginationContainer: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: '#11111173',
    borderRadius: 10,
    // maxWidth:'58%',
    // overflow:'hidden'
  },
  paginationDotContainer: {
    marginHorizontal: 2,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
    backgroundColor: 'white',
  },
  inactiveDot: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 4,
    borderColor: 'white',
  },
  carouselItem: {
    backgroundColor: 'lightgray',
    // borderRadius: 10,
    height: responsiveHeight(620),
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins',
    color: '#000000',
    textAlign: 'center',
  },
  subtitle2: {
    fontSize: 12,
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    fontFamily: 'Poppins',
    color: '#000000',
    textAlign: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Black with 60% opacity
    padding: 10,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    margin: 8,
  },
  headerTitle: {
    fontWeight: Platform.OS == 'android' ? '600' : '500',
    fontSize: 14,
    lineHeight: 16,
    fontFamily: 'Poppins',
    color: '#111111',
    width:'60%'
  },
  itemName: {
    fontSize: 12,
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    lineHeight: 16,
    fontFamily: 'Poppins',
    color: '#111111',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    fontFamily: 'Poppins',
    color: '#64646D',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    maxHeight: responsiveWidth(400),
    minHeight: responsiveWidth(180),
    // paddingBottom: 5,
    alignItems: 'center',
  },
  addressModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  addressModalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    maxHeight: responsiveWidth(400),
    minHeight: responsiveWidth(180),
    // paddingBottom: 5,
    // alignItems: 'center',
  },
  cutLine:{
    position:'absolute',
    left:0,
    top:'100%',
    width:'100%',
    height:1,
    backgroundColor:'lightgray',
    transform:[ {rotate: '-40deg'} ]
  }
});
