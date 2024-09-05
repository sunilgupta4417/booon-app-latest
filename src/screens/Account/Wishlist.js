import { SafeAreaView, StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Platform } from 'react-native'
import React, { useCallback, useState } from 'react'
import CustomHeader from '../../components/CustomHeader'
import { responsiveWidth } from '../../utils'
import axios from 'axios'
import { BASE_URL } from '../../config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import {useDispatch} from 'react-redux';

const Wishlist = ({ navigation }) => {
  const [wishListData, setWishListData] = useState([])
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      updateWishList()
    }, []))

  const updateWishList = async () => {
    const savedToken = await AsyncStorage.getItem('token')
    const { id } = JSON.parse(await AsyncStorage.getItem('userData'))
    if (savedToken) {
      const headers = {
        Authorization: `Bearer ${savedToken}`
      }
      const body = {
        user_id: id,
        device_id: global.deviceId
      }
      const response = await axios.post(`${BASE_URL}/wish-list`, body, { headers })
      console.log(response.data, "respwishList")
      if (response.data.status_code == 200) {
        setWishListData(response.data.data)
      }
    } else {
      navigation.navigate('Login')
    }
  }

  const getCount = async () => {
    const { id } = JSON.parse(await AsyncStorage.getItem('userData'));
    const body = {
      user_id: id,
      device_id: global.deviceId,
    };
    const response = await axios.post(`${BASE_URL}/counting`, body);
    dispatch({ type: 'BAG_COUNT', payload: response.data });
  };

  const removeWishist = async (item) => {
    const savedToken = await AsyncStorage.getItem('token');
    const {id} = JSON.parse(await AsyncStorage.getItem('userData'));
    if (savedToken) {
      const headers = {
        Authorization: `Bearer ${savedToken}`,
      };
      const body = {
        id: item.id,
        product_id: item?.product_id,
        user_id: id,
        device_id: global.deviceId,
      };
      const response = await axios.post(
        `${BASE_URL}/add-remove-wish-list`,
        body,
        {headers},
      );
      if (response.data.status_code == 200) {
        updateWishList()
        await getCount()
      }
    } else {
      navigation.navigate('Login');
    }
  };

  const renderWishlistItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductScreen', { item: item,wishlist:true })}
        style={{ marginVertical: 5, marginLeft: 10,position:'relative' }}>
        <Image
          style={{ width: responsiveWidth(190), height: responsiveWidth(240) }}
          source={{ uri:item.product_image }}
        />
        <TouchableOpacity onPress={()=>removeWishist(item)} style={styles.wishI}>
          <Image style={styles.wishIcon} source={require('../../assets/fav.png')} />
        </TouchableOpacity>
        <View style={{ width: responsiveWidth(190), padding: 5 }}>
          <Text style={styles.itemName}>{item.brandname}</Text>
          <Text style={styles.subtitle}>{item.shortdescription}</Text>
          <View
            style={{
              flexDirection: 'row',
              width: '84%',
            }}>
            <Text style={styles.itemName}>
              ₹{parseInt(item.sellprice) + '  '}
            </Text>
            <Text style={[styles.subtitle, { textDecorationLine: 'line-through' }]}>
              ₹{parseInt(item.costprice) + ' '}
            </Text>
            <Text style={styles.subtitle}> {item.discount}% Off</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={`Wishlist (${wishListData.length <= 9 ? "0" + wishListData.length : wishListData.length})`} back />
      <FlatList
        data={wishListData}
        extraData={wishListData}
        renderItem={renderWishlistItem}
        numColumns={2}
      />
    </SafeAreaView>
  )
}

export default Wishlist

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  wishI:{width:25,height:25,borderRadius:50,backgroundColor:"#fff",position:'absolute',top:10,right:10,flexDirection:'row',alignItems:'center',justifyContent:'center'},
  wishIcon:{width: 15,
    height: 15,resizeMode:'contain'},
  itemName: {
    fontSize: 12,
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    lineHeight: 14,
    fontFamily: 'Poppins',
    color: '#111111'
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14,
    fontFamily: 'Poppins',
    color: '#64646D'
  }
})