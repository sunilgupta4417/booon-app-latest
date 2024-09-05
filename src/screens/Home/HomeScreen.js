import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useState,
  useRef,
} from 'react';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import axios from 'axios';
import { BASE_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveWidth } from '../../utils';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
const { width: viewportWidth, height } = Dimensions.get('window');
import { getAddressList } from '../../hooks/hook';
import { useQuery } from '@tanstack/react-query';



// const SearchModal = (props, ref) => {
//   const [showModal, setShowModal] = useState(false);
//   const [data, setData] = useState([]);

//   useImperativeHandle(ref, () => ({
//     setShowModal: () => {
//       if (showModal == false) {
//         setShowModal(true);
//       }
//     },
//     setData,
//     onData: values => {
//       if (showModal == false) {
//         setShowModal(true);
//       }
//       setData(values);
//     },
//   }));
//   if (!showModal) return null;

//   const itemWidth = viewportWidth / 4;
//   return (
//     <View
//       style={{
//         position: 'absolute',
//         zIndex: 10,
//         left: 0,
//         top: 110,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'white',
//       }}>
//       <Text
//         style={{
//           fontSize: 15,
//           color: 'black',
//           marginTop: 10,
//           marginLeft: 15,
//           marginBottom: 14,
//         }}>
//         Recent Searches
//       </Text>
//       <View style={{ height: 40 }}>
//         {/* <FlatList
//           style={{ paddingHorizontal: 20 }}
//           horizontal={true}
//           data={['Black Tshirt', 'Dress for party', 'Dress for']}
//           renderItem={({ item }) => (
//             <View
//               style={{
//                 borderRadius: 20,
//                 borderColor: 'rgba(222, 222, 224, 1)',
//                 borderWidth: 1,
//                 height: 38,
//                 paddingHorizontal: 18,
//                 justifyContent: 'center',
//                 alignItems: 'center',
//               }}>
//               <Text style={{ fontSize: 15, color: 'black' }}>{item}</Text>
//             </View>
//           )}
//         /> */}
//       </View>
//       <Text
//         style={{
//           fontSize: 15,
//           color: 'black',
//           marginTop: 30,
//           marginLeft: 15,
//           marginBottom: 14,
//         }}>
//         Popular Categories
//       </Text>
//       <FlatList
//         data={data}
//         numColumns={4}
//         renderItem={({ item }) => (
//           <View
//             style={{
//               height: 106,
//               marginTop: 20,
//               alignItems: 'center',
//               width: itemWidth,
//             }}>
//             {item?.variants[0]?.imageUrls?.length > 0 ? (
//               <>
//                 <Image
//                   source={{ uri: item?.variants[0]?.imageUrls[0] }}
//                   style={{
//                     backgroundColor: '#e6e6e6',
//                     height: 64,
//                     width: 64,
//                     borderRadius: 60,
//                   }}
//                 />
//               </>
//             ) : null}

//             <Text
//               numberOfLines={2}
//               style={{ textAlign: 'center', marginTop: 7, fontSize: 12 }}>
//               {item?.variants[0]?.productName}
//             </Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// const SearchModalRef = forwardRef(SearchModal);

const HomeScreen = ({ navigation }) => {
  const searchRef = useRef();
  const { cart_count, wish_list_count } = useSelector(state => state.Cart);

  const [activeSlide, setActiveSlide] = useState(0);
  const [headerCatData, setHeaderCatData] = useState(null);
  const [bannerData, setBannerData] = useState([]);
  const [wearCompData, setWearCompData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [testimonial, setTestimonial] = useState([]);
  const [currentLocation, setCurrentLocation] = useState();
  const [addressChange, setaddressChange] = useState('false')
  const [SearchText, setSearchText] = useState('')
  const { data: addressDetail, isLoading } = useQuery({
    queryKey: ['address'],
    queryFn: getAddressList,
  });
  const [imageBase, setImageBase] = useState('');
  const [token, setToken] = useState(null);
  const [generalSetting, setGeneralSetting] = useState(null);
  const dispatch = useDispatch();

  const Allfunc = async () => {
    getBrandData();
    await getCount();
    await getHeaderCategory();
    await getBannerData();
    await  getWearCategory();
    await getTestimonials();
    await getTokenAndAddresses();
    generalSettings();
  }

  useFocusEffect(
    useCallback(() => {
      _getUserCurrentLocation();
      getTokenAndAddresses();
      getBrandData();
      Allfunc();
    }, []),
  );
  const getHeaderCategory = async () => {
    const response = await axios.get(`${BASE_URL}/header-category`);
    if (response.status == 200) {
      setHeaderCatData(response.data.data);
    }
  };
  const getBannerData = async () => {
    const response = await axios.get(`${BASE_URL}/adv-banner`);
    if (response.status) {
      setBannerData(response.data.data);
    }
  };
  const getWearCategory = async () => {
    const body = {
      get_type: 0,
    };
    const response = await axios.post(`${BASE_URL}/category-tags`, body);
    if (response.data.status_code == 200) {
      setWearCompData(response.data.data.tags);
    }
  };
  const getBrandData = async () => {
    const response = await axios.get(
      `${BASE_URL}/brand?seller_id=${global.sellerId}`,
    );
    if (response.data.status_code == 200) {
      setBrandData(response.data.data);
    }else{
      setBrandData([])
    }
  };
  const getTestimonials = async () => {
    const response = await axios.get(`${BASE_URL}/all-testimonial`);
    if (response.data.status_code == 200) {
      setImageBase(response.data.image_path);
      setTestimonial(response.data.data);
    }
  };

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

  const generalSettings = async () => {
    const response = await axios.get(`${BASE_URL}/general-setting`);
    if (response.data.status_code == 200) {
      global.imageThumbPath = response.data.data.thum_image
      setGeneralSetting(response.data.data);
    }
  };

  const getCount = async () => {
    const { id } = JSON.parse(await AsyncStorage.getItem('userData'));
    const body = {
      user_id: id,
      device_id: global.deviceId,
    };
    const response = await axios.post(`${BASE_URL}/counting`, body);
    dispatch({ type: 'BAG_COUNT', payload: response.data });
  };

  const _getUserCurrentLocation = async () => {
    // if(addressDetail?.data?.length > 0 ){
    //   await AsyncStorage.setItem('addressChange', 'false');
    // }else{
    //   await AsyncStorage.setItem('addressChange', 'true');
    // }
    const userCurrentLocation = await AsyncStorage.getItem('userCurrentLocation');
    const addressChanged = await AsyncStorage.getItem('addressChange');
    id = JSON.parse(userCurrentLocation)
    global.sellerId = id.sellerId
    setaddressChange(addressChanged)
    setCurrentLocation(JSON.parse(userCurrentLocation))
  }

  useEffect(()=>{
    _getUserCurrentLocation()
  },[currentLocation])
  

  const goToProductList = item => {
    navigation.navigate('SubCategory2', { bannerData: item });
  };

  const renderBanner = ({ item, index }) => (
    <TouchableOpacity onPress={() => goToProductList(item)} key={index+'banner'}>
      <ImageBackground source={{ uri: item.image }} style={styles.carouselItem}>
        <Image
          style={{ height: 26, width: 110, margin: 10 }}
          source={require('../../assets/boonLogo.png')}
        />
        <View style={styles.overlayWhite}>
          <Text style={styles.subtitle}>{item.title}</Text>
          <Text style={styles.subtitle2}>{item.detail}</Text>
          <View
            style={{
              borderWidth: 1,
              borderStyle: 'dashed',
              alignItems: 'center',
              padding: 2,
              margin: 5,
              borderRadius: 2,
              width: '60%',
              alignSelf: 'center',
            }}>
            <Text
              style={{
                fontSize: 11,
                // fontWeight: '600',
                fontFamily: 'Poppins-Medium',
                lineHeight: 20,
                color: '#000000',
              }}>
              {item.title}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
  const renderHeaderCat = ({ item, index }) => (
    <TouchableOpacity
    key={index+'cat'}
      onPress={() => {
        const params = {
          title: item.name,
          ...(item.cat_id && { cat_id: item.cat_id }),
          ...(item.subcat_id && { subcat_id: item.subcat_id }),
          ...(item.subsubcat_id && { subsubcat_id: item.subsubcat_id }),
        };
        navigation.navigate('SubCategory2', params);
      }}
      style={styles.flatListItem}>
      <Image style={styles.itemImage} source={{ uri: item.image }} />
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderBrands = ({ item, index }) => {
    return (
      <TouchableOpacity
      key={index+'brand'}
        onPress={() =>
          navigation.navigate('SubCategory2', { brandname: item.brand_name, title:item.brand_name})
        }>
        <Image
          style={{
            width: responsiveWidth(130),
            height: responsiveWidth(88),
            margin: 8,
            padding: 5,
          }}
          source={{ uri: item.image }}
        />
      </TouchableOpacity>
    );
  };

  const reanderHappyCustomer = ({ item,index }) => (
    <ImageBackground
    key={index+'custo'}
      style={{ width: 304, height: 354, justifyContent: 'flex-end', margin: 4 }}
      source={{ uri: `${imageBase}/${item.image}` }}>
      <View style={styles.overlay}>
        <Text style={styles.quote}>{item.message}</Text>
        <Text style={styles.author}>
          {item.name} {item.city}
        </Text>
      </View>
    </ImageBackground>
  );

  const WearComp = ({ img, title, subtitle, subsubCatData,index , direction }) => (
    <>
      <TouchableOpacity
      key={index+'wear'}
        onPress={() =>
          navigation.navigate('SubCategory', {
            title: title,
            tag: title,
            subsubCatData: subsubCatData,
          })
        }
        style={{
          flexDirection: direction,
          width: '96%',
          height: 110,
          alignItems: 'center',
          alignSelf: 'center',
          marginTop: 12,
        }}>
        <Image style={{ width: '50%', height: 110 }} source={{ uri: img }} />
        <View
          style={{
            backgroundColor: '#F0F0F0',
            flex: 1,
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: 14,
              // fontWeight: Platform.OS == 'android' ? '700' : '500',
              fontFamily: 'Poppins-SemiBold',
              lineHeight: 21,
              color: '#000000',
            }}>
            {title}
          </Text>
          <Text
            style={{
              fontSize: 12,
              // fontWeight: '400',
              lineHeight: 18,
              fontFamily: 'Poppins-Medium',
              color: '#000000',
            }}>
            {subtitle}
          </Text>
        </View>
      </TouchableOpacity>
      <Image
        style={{
          width: 28,
          height: 28,
          position: 'absolute',
          left: '46%',
          top: '40%',
        }}
        source={require('../../assets/Home/arrowR.png')}
      />
    </>
  );

  const navigateOnApp = (type, txt) => {
    if(type == 'whatsapp'){
      Linking.openURL('whatsapp://send?phone='+txt)
    }else{
      Linking.openURL('mailto:'+txt)
    }
  }
  const renderWearItem = ({ item, index }) => (
    <WearComp
      title={item.title}
      subtitle={item.sub_title}
      img={item.image}
      subsubCatData={item.data}
      index={index}
      direction={index % 2 === 0 ? 'row' : 'row-reverse'}
    />
  );
  const ShareButton = ({ url, txt, color,type,navigate }) => (
    <TouchableOpacity
    onPress={()=>navigateOnApp(type,txt)}
      style={{
        borderWidth: 1,
        borderColor: '#FFFFFF',
        width: '100%',
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
        marginBottom: 10,
      }}>
      <Image
        style={{
          height: 24,
          width: 24,
          backgroundColor: color,
          margin: 5,
          marginHorizontal: 10,
          borderRadius: 12,
        }}
        source={url}
      />
      <Text
        style={{
          fontSize: 14,
          fontWeight: '400',
          lineHeight: 21,
          fontFamily: 'Poppins',
          color: '#ffffff',
          marginHorizontal: 10,
        }}>
        {navigate}
      </Text>
    </TouchableOpacity>
  );

  const navigateSearch = async () => {
    await AsyncStorage.setItem('fromScreen', 'home')
    navigation.navigate('SearchLocation')
  }

  const navigateSearchScreen = () => {
    navigation.navigate('SearchProduct')
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <SearchModalRef ref={searchRef} /> */}
      <View style={styles.header}>
        <View>
          <Image
              source={require('../../assets/logoHome.png')}
              style={{width:40,height:40}}
            />
        </View>
        <View style={{marginLeft:15,flexGrow:1}}>
          <TouchableOpacity
            onPress={navigateSearch}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 0,
              width: responsiveWidth(180),
              // height: responsiveWidth(20),
              marginBottom: 5,
            }}>
            <View style={{ flexDirection: 'row' }}>
              <Text
                numberOfLines={1}
                style={[
                  styles.headerSubtitle,
                ]}>
                  {addressChange == 'false' ? addressDetail?.data?.length > 0
                  && <Text style={styles.headerTitle}>{addressDetail?.data[0]?.add_type + ', '}</Text>:
                  <Text style={styles.headerTitle}>{currentLocation?.add_type !== undefined && currentLocation?.add_type+', '}</Text>}
                {addressChange == 'false' ? addressDetail?.data?.length > 0
                  && addressDetail?.data[0]?.address
                  : currentLocation?.address}
              </Text>

              <View style={{ flexDirection: 'row' }}>
                <Image
                  style={{ height: 6, width: 10, margin: 4 }}
                  source={require('../../assets/Home/down.png')}
                />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery in 2 hours</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
            {wish_list_count > 0 && (
              <View
                style={{
                  backgroundColor: 'red',
                  height: 15,
                  width: 15,
                  borderRadius: 20,
                  position: 'absolute',
                  right: 6,
                  justifyContent: 'center',
                  alignItems: 'center',
                  top: 0,
                  zIndex: 1,
                }}>
                <Text style={{ color: 'white', fontSize: 8,fontFamily:'Poppins-Medium' }}>
                  {wish_list_count}
                </Text>
              </View>
            )}
            <Image
              source={require('../../assets/Wishlist.png')}
              style={styles.wishlist}
            />
          </TouchableOpacity>
          <TouchableOpacity  onPress={() => navigation.navigate('BagScreen')}>
            {cart_count > 0 && (
              <View
                style={{
                  backgroundColor: 'red',
                  height: 15,
                  width: 15,
                  borderRadius: 20,
                  position: 'absolute',
                  right: 7,
                  justifyContent: 'center',
                  alignItems: 'center',
                  top: 0,
                  zIndex: 1,
                }}>
                <Text style={{ color: 'white', fontSize: 8,fontFamily:'Poppins-Medium' }}>{cart_count}</Text>
              </View>
            )}
            <Image
              source={require('../../assets/Bag.png')}
              style={styles.wishlist}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.txtIpBox} onPress={navigateSearchScreen}>
          <Image
            style={styles.SearchIcon}
            source={require('../../assets/Search.png')}
          />
          <View >
            <Text style={styles.txtIp}>Search for products, brand and more...</Text>
          </View>
          {/* <TextInput
          onChangeText={(text)=>setSearchText(text)}
          value={SearchText}
            onSubmitEditing={productSearchingHook}
            placeholder="Search for products, brand and more..."
            style={styles.txtIp}
          /> */}
        </TouchableOpacity>
        <FlatList
          data={headerCatData}
          renderItem={renderHeaderCat}
          horizontal={true}
          // contentContainerStyle={styles.flatList}
          showsHorizontalScrollIndicator={false}
          style={{ maxHeight: 106 }}
        />
        <View style={styles.carouselWrapper}>
          <Carousel
            data={bannerData}
            renderItem={renderBanner}
            sliderWidth={viewportWidth}
            itemWidth={viewportWidth}
            layout={'default'}
            onSnapToItem={i => setActiveSlide(i)}
          />
          <Pagination
            dotsLength={bannerData?.length}
            activeDotIndex={activeSlide}
            containerStyle={styles.paginationContainer}
            dotContainerStyle={styles.paginationDotContainer}
            dotStyle={styles.paginationDot}
            inactiveDotStyle={styles.inactiveDot}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.8}
          />
        </View>

        <FlatList
          data={wearCompData}
          renderItem={renderWearItem}
          keyExtractor={(item, index) => index.toString()}
        // contentContainerStyle={{ paddingBottom: 20 }}
        />
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-evenly',
            borderWidth: 0,
            alignSelf: 'center',
            marginVertical: 15,
          }}>
          {/* <FlatList
                 data={generalSetting.setting}
                 renderItem={renderGeneralSetting}
                 horizontal
                /> */}
          {generalSetting?.setting.map(item => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 0,
                width:100
                // marginHorizontal: responsiveWidth(15),
              }}>
              <Image
                style={{ width: 40, height: 40,resizeMode:'contain' }}
                source={{ uri: item.title }}
              />
              <Text
                numberOfLines={2}
                style={{
                  fontSize: 14,
                  // fontWeight: '400',
                  alignSelf: 'center',
                  textAlign: 'center',
                  lineHeight: 16,
                  fontFamily: 'Poppins-Medium',
                  color: '#111111',
                }}>
                {item.icon}
              </Text>
            </View>
          ))}
        </View>
        {brandData?.length > 0 && <><Text
          style={{
            fontSize: 16,
            // fontWeight: '500',
            margin: 8,
            marginTop: 20,
            fontFamily: 'Poppins-SemiBold',
            color: '#111111',
          }}>
          Brand Spotlight
        </Text>
        <FlatList
          data={brandData}
          renderItem={renderBrands}
          horizontal
          showsHorizontalScrollIndicator={false}
        /></>
        }
        <Text
          style={{
            fontSize: 16,
            // fontWeight: '500',
            margin: 8,
            marginTop: 25,
            fontFamily: 'Poppins-SemiBold',
            color: '#111111',
          }}>
          Happy Customers
        </Text>
        <FlatList
          data={testimonial}
          renderItem={reanderHappyCustomer}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginLeft: 8 }}
        />
        <View
          style={{
            backgroundColor: '#1D1D2D',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              backgroundColor: '#27273C',
              padding: 18,
              margin: 18,
              width: '90%',
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                lineHeight: 24,
                fontFamily: 'Poppins-Medium',
                color: '#FFFFFF',
              }}>
              {generalSetting?.home_contact_title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '400',
                lineHeight: 21,
                fontFamily: 'Poppins',
                color: '#FFFFFF',
                marginVertical: 14,
              }}>
              {generalSetting?.home_contact_detail}
            </Text>
            <ShareButton
              txt={generalSetting?.whatsapp_number}
              navigate={generalSetting?.whatsapp_message}
              type={'whatsapp'}
              url={require('../../assets/Home/watsapp.png')}
            />
            <ShareButton
              type={'mail'}
              txt={generalSetting?.email}
              navigate={generalSetting?.email_message}
              url={require('../../assets/Home/share.png')}
              color={'#E5DFD2'}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    // paddingHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems:'center',
    margin: 10,
  },
  headerTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111111',
  },
  headerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111111',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  wishlist: {
    height: 32,
    width: 32,
    marginHorizontal: 5,
  },
  txtIpBox: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 4,
    height: 40,
    width: '94%',
    alignSelf: 'center',
    borderColor: 'grey',
    borderRadius: 20,
    marginBottom: 10, // Add margin below the search box
  },
  txtIp: {
    padding: 5,
    flex: 1,
    fontFamily:'Poppins-Medium'
  },
  SearchIcon: {
    width: 24,
    height: 24,
    margin: 4,
    marginHorizontal: 5,
  },
  flatList: {
    // height: 10, // Adjusted height for the FlatList
  },
  flatListItem: {
    alignItems: 'center',
    // justifyContent: "center", // Center items vertically
    width: 80,
    borderWidth: 0,
    paddingBottom: 10,
    // height: 106
    // marginHorizontal: 8 // Adjusted margin
  },
  itemImage: {
    height: 64,
    width: 64,
    borderRadius: 37,
    margin: 5, // Adjusted margin for spacing
  },
  itemText: {
    fontSize: 12, // Smaller text to fit in reduced height
    // fontWeight: '400',
    lineHeight: 18,
    fontFamily:'Poppins-Medium',
    color: '#212121',
  },
  carouselWrapper: {
    marginTop: 0,
  },
  carouselItem: {
    backgroundColor: 'lightgray',
    // borderRadius: 10,
    height: 282,
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
    // fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#000000',
    textAlign: 'center',
  },
  subtitle2: {
    fontSize: 12,
    // fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#000000',
    textAlign: 'center',
  },
  paginationContainer: {
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  paginationDotContainer: {
    marginHorizontal: 0,
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
    borderWidth: 2,
    borderColor: 'white',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Black with 60% opacity
    padding: 10,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    margin: 8,
  },
  quote: {
    color: 'white',
    fontSize: 12,
    // fontWeight: '400',
    marginBottom: 10,
    lineHeight: 18,
    fontFamily: 'Poppins-Medium',
  },
  author: {
    color: 'white',
    fontSize: 12,
    // fontWeight: '600',
    lineHeight: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  overlayWhite: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    padding: 10,
    width: '80%',
    height: 82,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    maxHeight: responsiveWidth(400),
    minHeight: responsiveWidth(180),
    // paddingBottom: 5,
    // alignItems: 'center',
  },
});
