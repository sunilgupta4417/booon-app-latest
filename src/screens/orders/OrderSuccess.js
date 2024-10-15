import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import cross from '../../assets/cross.png';
import { Image } from 'react-native-elements';
import successImage from '../../assets/ordersuccess.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../config';

export default function OrderSuccess({ navigation, route }) {
  const [modalVisible, setModalVisible] = useState(false);

  const routeData = route?.params;

  const CancelOrderButton = () => {
    const [loading, setLoading] = useState(false);

    const onCancelOrder = async () => {
      setLoading(true);
      const savedToken = await AsyncStorage.getItem('token');
      let data = JSON.stringify({
        'id': routeData?.orderResponse.order_ids
      });
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://apistaging.booon.in/api/cancel-order?ids=${routeData?.orderResponse?.order_ids.join(',')}`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${savedToken}`
        },
      };
      axios.request(config)
        .then((response) => {
          console.log(JSON.stringify(response.data));
          navigation.navigate('Account', { response });
        })
        .catch((error) => {
          console.log(error);
        });
      setLoading(false);
    };

    return (
      <TouchableOpacity
        onPress={onCancelOrder}
        style={{
          height: 40,
          backgroundColor: 'black',
          paddingHorizontal: 27,
          justifyContent: 'center',
          borderRadius: 30,
          alignItems: 'center',
        }}>
        {loading ? (
          <ActivityIndicator color={'white'} />
        ) : (
          <Text style={{ fontSize: 12, color: 'white' }}>Yes Cancel</Text>
        )}
      </TouchableOpacity>
    );
  };
  const CountDown = () => {
    const [timeLeft, setTimeLeft] = useState(120);
    useEffect(() => {
      if (timeLeft > 0) {
        const timerId = setInterval(() => {
          setTimeLeft(timeLeft => timeLeft - 1);
        }, 1000);

        return () => clearInterval(timerId); // Cleanup the interval on component unmount
      } else {
        navigation.navigate('Account')
      }
    }, [timeLeft]);

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: 25,
          marginBottom: 45,
        }}>
        <View>
          <Text style={{ fontSize: 14, fontFamily: 'Poppins', color: 'black' }}>
            Ordered by mistake?
          </Text>
          <Text
            style={{
              fontSize: 14,
              marginTop: 7,
              fontFamily: 'Poppins',
              color: 'black',
            }}>
            Cancel within {formatTime(timeLeft)} minutes
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (timeLeft > 0) {
              setModalVisible(true);
            }

          }}
          style={{
            height: 40,
            width: 124,
            borderWidth: 1,
            borderRadius: 30,
            borderColor: 'rgba(222, 222, 224, 1)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontFamily: 'Poppins',
              fontWeight: '600',
              color: 'black',
              fontSize: 14,
            }}>
            Cancel Order
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(17, 17, 17, 0.4)',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              paddingVertical: 15,
              paddingBottom: 22,
              paddingHorizontal: 10,
            }}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
              }}>
              <Image
                source={cross}
                style={{
                  height: 25,
                  width: 25,
                  resizeMode: 'contain',
                }}
              />
            </TouchableOpacity>
            <Text
              style={{
                width: 179,
                alignSelf: 'center',
                textAlign: 'center',
                color: 'black',
                fontSize: 14,
                fontFamily: 'Poppins',
                marginBottom: 20,
                marginTop: 20,
              }}>
              Are you sure you want to cancel this order?
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: 15,
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                }}
                style={{
                  height: 40,
                  paddingHorizontal: 27,
                  justifyContent: 'center',
                  borderColor: 'rgba(222, 222, 224, 1)',
                  borderWidth: 1,
                  borderRadius: 30,
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 12, color: 'black' }}>Don't Cancel</Text>
              </TouchableOpacity>

              <CancelOrderButton />
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Account');
        }}>
        <Image
          source={cross}
          style={{
            height: 32,
            marginTop: 30,
            marginLeft: 15,
            width: 32,
            resizeMode: 'contain',
          }}
        />
      </TouchableOpacity>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={successImage}
          style={{
            height: 100,
            // marginTop: 30,
            // marginLeft: 15,
            marginBottom: 20,
            width: 100,
            resizeMode: 'contain',
          }}
        />
        <Text style={{ fontFamily: 'Poppins', fontSize: 16, color: 'black' }}>
          Order Placed Successfully
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins',
            marginTop: 5,
            fontSize: 15,
            color: 'rgba(100, 100, 109, 1)',
          }}>
          You will receive your styles by {routeData?.DeleiveryTime}
        </Text>
        <View
          style={{
            marginTop: 25,
            height: 40,
            width: 170,
            borderWidth: 1,
            borderRadius: 30,
            backgroundColor: 'rgba(33, 33, 47, 1)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: 'white',
              fontSize: 12,
              fontFamily: 'Poppins',
              fontWeight: '600',
            }}>
            Track Order
          </Text>
        </View>
      </View>
      <CountDown />
    </View>
  );
}

const styles = StyleSheet.create({});
