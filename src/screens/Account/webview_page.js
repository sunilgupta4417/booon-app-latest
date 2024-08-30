import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import WebView from 'react-native-webview';
import CustomHeader from '../../components/CustomHeader';


AvenueParams = {
  // merchant_server_enc_url:"http://122.182.6.212:8080/MobPHPKit/india/init_payment_2.php?",
  // ccavenue_payment_url:"https://secure.ccavenue.com/transaction.do"

  merchant_server_enc_url:
    'http://122.182.6.212:8080/MobPHPKit/india/init_payment.php',
  ccavenue_payment_url: 'https://qasecure.ccavenue.com/transaction.do',
};

export default function WebViewPage({route}) {
  console.log(route.params);

  let web_url = AvenueParams.ccavenue_payment_url;


  let commamd = 'initiateTransaction';
  let params = {
    enc_val: route.params?.response?.enc_val,
    access_code: route.params?.response?.access_code,
    cancel_url: route.params?.response?.cancel_url,
    redirect_url: route.params?.response?.redirect_url,
    order_id: route.params?.response?.order_id,
  };

  let accces = params?.access_code;

  const loadHtml =()=>{
    var html =
        `<html> <head><meta name='viewport' content='width=device-width, initial-scale=1.0'></head> <body onload='document.f.submit();'> <form id='f' name='f' method='post' action='${web_url}'>` +
            `<input type='hidden' name='command' value='${commamd}'/>` +
            `<input type='hidden' name='encRequest' value='${params.enc_val}'/>` +
            `<input  type='hidden' name='access_code' value='${accces}' />`;
    //console.log("html",html);
    return html + "</form> </body> </html>";
  }

  const INJECTEDJAVASCRIPT =
    "const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=0.99, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); ";

// 110001
    const  paymentUrl =route.params?.response?.enc_val
  
  console.log(params,'============>',loadHtml())
    return (
    <View style={{flex: 1}}>
        <CustomHeader
            back
            title={`Payment`}
          />
      <WebView
        automaticallyAdjustContentInsets={false}
        //    ref={(ref) => (setWebView(ref))}
        source={{
          // uri:paymentUrl
          uri:params.enc_val
          //  uri: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction&access_code=AVLA00EA83AK67ALKA&encRequest=30bff25ea5c49f9296fd2b9d9f09050798d54e45fcd7090edfcd0ca8469fa5430521c2aa02a5b49be67e52b287628ef85bf415338c6bbf844b732cc288c9941b2ee780dc2ade04d08de53ba6a47f554be9a066caec65c596831e7edb21ad234ce74d9cea4bd4647171e091c9bdf7d8c1550e99e1f6bdc8b812bf55e4a44325b0bd709f722e6b1a50285f54ef6c0502a07bcc8a62219749eb73522553e0518c540ff0e7b71d46e570330b17b9c4f9ba506c42227dc294ad369f49b83db527be43ba8cd36b96be7f88eaf61d984458edb0487a0c7aec71d3f38db75006d5d2b134b72bb08180caa532fb88b788fadb3268129008168451f0a157fc87639954c226'
          // html: loadHtml(),
        }}
        injectedJavaScript={INJECTEDJAVASCRIPT}
        //    injectedJavaScriptBeforeContentLoaded={pucJavaScript}
        scrollEnabled
        scalesPageToFit={false}
        //    originWhitelist={['*']}
        //   // injectedJavaScript={jsCode}
        //    onMessage={_onMessage}
        //    javaScriptEnabled={true}
        cacheEnabled={true}
        allowFileAccessFromFileURLs={true}
        setSupportMultipleWindows={true}
        domStorageEnabled={true}
        allowUniversalAccessFromFileURLs={true}
        //    // finalUrl={params.redirect_url}
        //    // onNavigationCompleted={(event) => console.log('Navigation to issues completed')}

        //    onShouldStartLoadWithRequest={(request)=>{
        //      console.log('onShouldStartLoadWithRequest: ', request)
        //      const {url} = request;
        //      console.log('onShouldStartLoadWithRequest Url: ', url)
        //        if (url === params.redirect_url || url === params.cancel_url) {
        //        // setTrUrl(navState.url);
        //        // setTrUrlStatus('T');

        //        webview.injectJavaScript(pucJavaScript);
        //        //webview.stopLoading();
        //       // return false;
        //      }
        //      return true;
        //    }}
        startInLoadingState={true}
        //    // onLoadStart={(syntheticEvent) => {
        //    //    const { nativeEvent } = syntheticEvent;
        //    //   setVisible(true)
        //    // }}

        //    // startInLoadingStateSS
        //    onNavigationStateChange={onNavigationStateChange}
        //    renderLoading={ActivityIndicatorElement}

        //    onLoad={() => setVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({});

// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow strict-local
//  */

// import React,{useState,useEffect} from 'react';
// import {
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   ActivityIndicator,
//   BackHandler,
//   useColorScheme,
//   View,
//   Alert,
// } from 'react-native';
// import { cos } from 'react-native-reanimated';
// import WebView from 'react-native-webview';
// //import { WebView } from 'react-native';

// import {
//   Colors,
//   DebugInstructions,
//   Header,
//   LearnMoreLinks,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';
// // import { AvenueParams } from '../params';
// //import CustomWebView from './customWebView';

// AvenueParams = {
//     // merchant_server_enc_url:"http://122.182.6.212:8080/MobPHPKit/india/init_payment_2.php?",
//     // ccavenue_payment_url:"https://secure.ccavenue.com/transaction.do"

//     merchant_server_enc_url:"http://122.182.6.212:8080/MobPHPKit/india/init_payment.php",
//     ccavenue_payment_url:"https://qasecure.ccavenue.com/transaction.do"
// }

// function WebViewPage ({route, navigation}){

//  const [visible,setVisible] = useState(true)
//  const [trUrlStatus, setTrUrlStatus] = useState('');
//  const [trUrl,setTrUrl] = useState('')
//  const isDarkMode = useColorScheme() === 'dark';
//  const [webview,setWebView] = useState(null);

//  let params = {
//     enc_val:route.params?.response?.enc_val,
//     access_code:route.params?.response?.access_code,
//     cancel_url:route.params?.response?.cancel_url,
//     redirect_url:route.params?.response?.redirect_url,
//     order_id:route.params?.response?.order_id
//   }

//   let payload = {
//    command:"initiateTransaction",
//    encRequest:route.params.response.enc_val,
//    access_code:route.params.response.access_code,
//   }

//   const ActivityIndicatorElement = () => {

//    return (
//      <View style={styles.ActivityIndicatorStyle}>
//        <ActivityIndicator
//          color='gray'
//          size='large'
//        />
//      </View>
//    );
//  }

//  function handleBackButtonClick(){
//    // console.log("back Pressed wow")
//    Alert.alert(
//        'Exit',
//        'Do you really want to cancel this transaction?', [{
//            text: 'Cancel',
//            onPress: () => console.log('Cancel Pressed'),
//            style: 'cancel'
//        }, {
//            text: 'OK',
//            onPress: () => navigation.goBack()
//        },], {
//        cancelable: false
//    }
//    )
//    return true;
// }

//  useEffect(() => {

//   BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

//    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);

//    return () => backHandler.remove();
//  }, []);

//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };

//   const onNavigationStateChange = (navState) => {
//    console.log('WebView onNavigationStateChange url = ', navState.url);
//    if (navState.url === params.redirect_url || navState.url === params.cancel_url) {
//      console.log('trUrl = ', navState.url);
//      webview.injectJavaScript(pucJavaScript);
//      webview.stopLoading();

//    }
//  }

//  const _onMessage = (event) => {

//    var getData = event.nativeEvent.data;
//     console.log('handled _onMessage : ', getData);
//     if(getData != null){
//       //Alert.alert('Success',getData);
//      //  navigation.navigate('Status', {
//      //       objJson: getData,
//      //     });

//     }
//    // console.log('trUrl status : ', trUrlStatus);

//    // if (trUrlStatus === 'T') {
//    //   navigation.navigate('Status', {
//    //     objJson: getData,
//    //   });
//    // }
//  }

//  const jsCode = `
//    var interval = setInterval(function(){
//      var sourceCode = document.getElementsByTagName('body')[0].innerHTML.toString()

//      //if(sourceCode.indexOf('shopping with us.')>-1){
//        window.ReactNativeWebView.postMessage(sourceCode)
//        clearInterval(interval);
//      //}
//    },1000);`;

//    const pucJavaScript = `
//      var sourceCode = document.getElementsByName('encResp')[0].value;
//      window.ReactNativeWebView.postMessage(sourceCode);
//    //window.ReactNativeWebView.postMessage(JSON.stringify(window.location));
//       `;

//  // let web_url = "https://test.ccavenue.com/transaction/transaction.do";
//  // let commamd = "initiateTransaction";
//  // let accces = "AVLA00EA83AK67ALKA&encRequest=30bff25ea5c49f9296fd2b9d9f09050798d54e45fcd7090edfcd0ca8469fa5430521c2aa02a5b49be67e52b287628ef85bf415338c6bbf844b732cc288c9941b2ee780dc2ade04d08de53ba6a47f554be9a066caec65c596831e7edb21ad234ce74d9cea4bd4647171e091c9bdf7d8c1550e99e1f6bdc8b812bf55e4a44325b0bd709f722e6b1a50285f54ef6c0502a07bcc8a62219749eb73522553e0518c540ff0e7b71d46e570330b17b9c4f9ba506c42227dc294ad369f49b83db527be43ba8cd36b96be7f88eaf61d984458edb0487a0c7aec71d3f38db75006d5d2b134b72bb08180caa532fb88b788fadb3268129008168451f0a157fc87639954c226";
//  // //console.log('WebView url = ', web_url);
//  // //console.log('pay load is ',payload);
//  // let url = ""

//  // const loadHtml =()=>{
//  //   var html =
//  //       `<html> <head><meta name='viewport' content='width=device-width, initial-scale=1.0'></head> <body onload='document.f.submit();'> <form id='f' name='f' method='post' action='${web_url}'>` +
//  //           `<input type='hidden' name='command' value='${commamd}'/>` +
//  //           `<input  type='hidden' name='access_code' value='${accces}' />`;
//  //   //console.log("html",html);
//  //   return html + "</form> </body> </html>";
//  // }

//  let web_url = AvenueParams.ccavenue_payment_url;
//  let commamd = "initiateTransaction";
//  let accces = params.access_code;
//  //console.log('WebView url = ', web_url);
//  //console.log('pay load is ',payload);
//  let url = ""

//  const loadHtml =()=>{
//    var html =
//        `<html> <head><meta name='viewport' content='width=device-width, initial-scale=1.0'></head> <body onload='document.f.submit();'> <form id='f' name='f' method='post' action='${web_url}'>` +
//            `<input type='hidden' name='command' value='${commamd}'/>` +
//            `<input type='hidden' name='encRequest' value='${params.enc_val}'/>` +
//            `<input  type='hidden' name='access_code' value='${accces}' />`;
//    //console.log("html",html);
//    return html + "</form> </body> </html>";
//  }
//

//  return (
//    <SafeAreaView style={{flex:1}}>
//  <WebView
//    automaticallyAdjustContentInsets={false}
//    ref={(ref) => (setWebView(ref))}
//    source={{
//    //  uri: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction&access_code=AVLA00EA83AK67ALKA&encRequest=30bff25ea5c49f9296fd2b9d9f09050798d54e45fcd7090edfcd0ca8469fa5430521c2aa02a5b49be67e52b287628ef85bf415338c6bbf844b732cc288c9941b2ee780dc2ade04d08de53ba6a47f554be9a066caec65c596831e7edb21ad234ce74d9cea4bd4647171e091c9bdf7d8c1550e99e1f6bdc8b812bf55e4a44325b0bd709f722e6b1a50285f54ef6c0502a07bcc8a62219749eb73522553e0518c540ff0e7b71d46e570330b17b9c4f9ba506c42227dc294ad369f49b83db527be43ba8cd36b96be7f88eaf61d984458edb0487a0c7aec71d3f38db75006d5d2b134b72bb08180caa532fb88b788fadb3268129008168451f0a157fc87639954c226'
//      html:loadHtml()
//    }}
//    injectedJavaScript={INJECTEDJAVASCRIPT}
//    injectedJavaScriptBeforeContentLoaded={pucJavaScript}
//    scrollEnabled
//    scalesPageToFit={false}
//    originWhitelist={['*']}
//   // injectedJavaScript={jsCode}
//    onMessage={_onMessage}
//    javaScriptEnabled={true}
//    cacheEnabled={true}
//    allowFileAccessFromFileURLs={true}
//    setSupportMultipleWindows={true}
//    domStorageEnabled={true}
//    allowUniversalAccessFromFileURLs={true}
//    // finalUrl={params.redirect_url}
//    // onNavigationCompleted={(event) => console.log('Navigation to issues completed')}

//    onShouldStartLoadWithRequest={(request)=>{
//      console.log('onShouldStartLoadWithRequest: ', request)
//      const {url} = request;
//      console.log('onShouldStartLoadWithRequest Url: ', url)
//        if (url === params.redirect_url || url === params.cancel_url) {
//        // setTrUrl(navState.url);
//        // setTrUrlStatus('T');

//        webview.injectJavaScript(pucJavaScript);
//        //webview.stopLoading();
//       // return false;
//      }
//      return true;
//    }}
//    startInLoadingState={true}
//    // onLoadStart={(syntheticEvent) => {
//    //    const { nativeEvent } = syntheticEvent;
//    //   setVisible(true)
//    // }}

//    // startInLoadingStateSS
//    onNavigationStateChange={onNavigationStateChange}
//    renderLoading={ActivityIndicatorElement}

//    onLoad={() => setVisible(false)}
//  />
//      {visible ? <ActivityIndicatorElement /> : null}
//    </SafeAreaView>
//  );
// };

// const styles = StyleSheet.create({
//  ActivityIndicatorStyle: {
//    flex: 1,
//    position: 'absolute',
//    marginLeft: 'auto',
//    marginRight: 'auto',
//    marginTop: 'auto',
//    marginBottom: 'auto',
//    left: 0,
//    right: 0,
//    top: 0,
//    bottom: 0,
//    justifyContent: 'center',

//  },
// })

// export default WebViewPage;
