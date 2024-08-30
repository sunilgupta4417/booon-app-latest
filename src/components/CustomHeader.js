import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
const CustomHeader = ({title, onPress, back, search, wishlist, bag}) => {
  const {cart_count, wish_list_count} = useSelector(state => state.Cart);
  const navigation = useNavigation();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 5,
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {back && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image style={styles.icon} source={require('../assets/back.png')} />
          </TouchableOpacity>
        )}
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            fontFamily: 'Poppins-SemiBold',
            margin: 10,
            color: '#111111',
          }}>
          {title}
        </Text>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {search && (
          <TouchableOpacity>
            <Image
              style={{
                height: 24,
                width: 24,
                marginRight: 12,
                marginVertical: 5,
              }}
              source={require('../assets/Search.png')}
            />
          </TouchableOpacity>
        )}
        {wishlist && (
          <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
           {wish_list_count>0&& <View
              style={{
                backgroundColor: 'red',
                height: 15,
                width: 15,
                borderRadius: 20,
                position: 'absolute',
                right: 11,
                justifyContent: 'center',
                alignItems: 'center',
                top: 8,
                zIndex: 1,
              }}>
              <Text style={{color: 'white', fontSize: 8}}>
                {wish_list_count}
              </Text>
            </View>}
            <Image
              style={{
                height: 34,
                width: 34,
                marginRight: 10,
                marginVertical: 5,
              }}
              source={require('../assets/Wishlist.png')}
            />
          </TouchableOpacity>
        )}
        {bag && (
          <TouchableOpacity onPress={() => navigation.navigate('BagScreen')}>
            {cart_count>0&&<View
              style={{
                backgroundColor: 'red',
                height: 15,
                width: 15,
                borderRadius: 20,
                position: 'absolute',
                right: 11,
                justifyContent: 'center',
                alignItems: 'center',
                top: 8,
                zIndex: 1,
              }}>
              <Text style={{color: 'white', fontSize: 8}}>{cart_count}</Text>
            </View>}
            <Image
              style={{
                height: 34,
                width: 34,
                marginRight: 10,
                marginVertical: 5,
              }}
              source={require('../assets/Bag.png')}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  icon: {
    width: 32,
    height: 32,
  },
});
