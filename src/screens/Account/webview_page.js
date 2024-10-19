import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import {React, useRef } from 'react';
import WebView from 'react-native-webview';
import CustomHeader from '../../components/CustomHeader';
import { Linking, ToastAndroid } from 'react-native';


AvenueParams = {
  // merchant_server_enc_url:"http://122.182.6.212:8080/MobPHPKit/india/init_payment_2.php?",
  // ccavenue_payment_url:"https://secure.ccavenue.com/transaction.do"

  merchant_server_enc_url:
    'http://122.182.6.212:8080/MobPHPKit/india/init_payment.php',
  ccavenue_payment_url: 'https://qasecure.ccavenue.com/transaction.do',
};



export default function WebViewPage({ route }) {
  const webviewRef = useRef(null);
  console.log(route.params);

  
  const handleUrlLoading = (event) => {
    const { url } = event;
    console.log(url);

    if (url.includes('upi://pay?pa')) {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            ToastAndroid.show('UPI supported applications not found', ToastAndroid.LONG);
            webviewRef.current.injectJavaScript(
              'document.getElementsByClassName("intent-off")[0].click();'
            );
          }
        })
        .catch((err) => {
          console.error("Error opening URL: ", err);
        });

      return false; // Prevent WebView from loading the URL
    }

    return true; // Allow WebView to load the URL
  };

 

  let web_url = AvenueParams.ccavenue_payment_url;


  let commamd = 'initiateTransaction';
  let params = {
    enc_val: route.params?.response?.enc_val,
    access_code: route.params?.response?.access_code,
    cancel_url: route.params?.response?.cancel_url,
    redirect_url: route.params?.response?.redirect_url,
    order_id: route.params?.response?.order_id,
    merchant_id: route.params?.response?.merchant_id,
  };

  const encodedEncVal = encodeURIComponent(params.enc_val);
  console.log('Encoded Enc Val:', encodedEncVal);
  // merchant_id
  let accces = params?.access_code;

  const loadHtml = () => {
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
  const paymentUrl = route.params?.response?.enc_val

  console.log('============>', params.enc_val)
  return (
    <SafeAreaView style={{ flex: 1 , backgroundColor: "transparent" }}>
      <View style={{ flex: 1 }}>
        <CustomHeader
          back
          title={`Payment`}
        />
        <WebView
          automaticallyAdjustContentInsets={false}
          //    ref={(ref) => (setWebView(ref))}
          source={{
            // uri:paymentUrl
            uri: params.enc_val
            //  uri: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction&access_code=AVLA00EA83AK67ALKA&encRequest=30bff25ea5c49f9296fd2b9d9f09050798d54e45fcd7090edfcd0ca8469fa5430521c2aa02a5b49be67e52b287628ef85bf415338c6bbf844b732cc288c9941b2ee780dc2ade04d08de53ba6a47f554be9a066caec65c596831e7edb21ad234ce74d9cea4bd4647171e091c9bdf7d8c1550e99e1f6bdc8b812bf55e4a44325b0bd709f722e6b1a50285f54ef6c0502a07bcc8a62219749eb73522553e0518c540ff0e7b71d46e570330b17b9c4f9ba506c42227dc294ad369f49b83db527be43ba8cd36b96be7f88eaf61d984458edb0487a0c7aec71d3f38db75006d5d2b134b72bb08180caa532fb88b788fadb3268129008168451f0a157fc87639954c226'
            //  uri: "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction&encRequest=9822360ab01211504a7a0f0c25de7e78ee336f50f70f44b1ae3cd2699656f8b6b88b1f7d4865761230b3c45ee43eedd942fbe7483de0f2587022594a0c8e553a0b48543c6c6a608f048aede5bfecd03382b053dbe1f31625ee9a23bca862974392c48a17f80c30c7878ffdfa9c69122c2b7af107f63a05ed09f44bf3a8a9338c381d840b11cd2e734b2987c49a0127e93b0400f48690b6b709938239c146ba446e88f219f1af499b758511f9c22c2210dbecee7048e12b18dd66ffa308fe2582&access_code=AVUX68LC83AJ90XUJA&working_key=14C009070858693D42FB299F831343BD"
            // html: loadHtml(),
          }}
          injectedJavaScript={INJECTEDJAVASCRIPT}
          //    injectedJavaScriptBeforeContentLoaded={pucJavaScript}
          scrollEnabled
          scalesPageToFit={false}
          onShouldStartLoadWithRequest={handleUrlLoading}
        
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});