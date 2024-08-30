import {SafeAreaView, Platform, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react';
import WebView from 'react-native-webview';
import CustomHeader from './CustomHeader';
import {BASE_URL} from '../config';
import axios from 'axios';
const WebViewComp = ({navigation, route: {params}}) => {
  const [html, setHtml] = useState('<p></p>');
   const [loading,setLoading] = useState(true)

  const getApi = async () => {
    try {
      let response = html;

      if (params == 'm-about-us') {
        response = await axios.get(`${BASE_URL}/cms-page/m-about-us`);
      }
  
      if (params == 'm-faq') {
        response = await axios.get(`${BASE_URL}/cms-page/m-faq`);
      }
  
      if (params == 'm-privacy-policy') {
        response = await axios.get(`${BASE_URL}/cms-page/m-privacy-policy`);
      }
  
      if (params == 'm-shipping-policy') {
        response = await axios.get(`${BASE_URL}/cms-page/m-shipping-policy`);
      }
  
      setHtml(response?.data?.data?.description);
      setLoading(false)
    } catch (error) {
      setHtml('<p>Something went wrong</p>')
      setLoading(false)
    }
  
  };

  useEffect(() => {
    getApi();
  }, []);
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FFFFFF'}}>
      <CustomHeader back />
      {loading?<ActivityIndicator size={'large'} />:  <WebView
        scalesPageToFit={Platform.OS !== 'android'}
        source={{html: html}}
        // source={{uri: params.url}}
        style={{flex: 1}}
      />}
    
    </SafeAreaView>
  );
};

export default WebViewComp;

const styles = StyleSheet.create({});
