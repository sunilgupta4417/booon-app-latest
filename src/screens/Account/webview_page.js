import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {React, useRef, useState} from 'react';
import WebView from 'react-native-webview';
import CustomHeader from '../../components/CustomHeader';
import {Linking, ToastAndroid} from 'react-native';

AvenueParams = {
  merchant_server_enc_url: 'https://apistaging.booon.in/api/ccavenue-order',
  ccavenue_payment_url: 'https://secure.ccavenue.com/transaction.do',
};

export default function WebViewPage({route}) {
  const [webView, setWebView] = useState(null);
  const webviewRef = useRef(null);
  console.log(route.params);

  /* const handleUrlLoading = (event) => {
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
  };*/

  let web_url = AvenueParams.ccavenue_payment_url;
  const pucJavaScript = `
  var sourceCode = document.getElementsByName('encResp')[0].value;
  window.ReactNativeWebView.postMessage(sourceCode);
//window.ReactNativeWebView.postMessage(JSON.stringify(window.location));
   `;

  let commamd = 'initiateTransaction';
  let params = {
    enc_val: route.params?.response?.enc_val,
    access_code: route.params?.response?.access_code,
    cancel_url: route.params?.response?.cancel_url,
    redirect_url: route.params?.response?.redirect_url,
    order_id: route.params?.response?.order_id,
    merchant_id: route.params?.response?.merchant_id,
  };

  /*let params = {
    enc_val: `https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction&encRequest=fd78e43b343b80a9025915bc89253eb14318a978a96def4b5f88fce15c7c60a1b985e06a8e15d0c4eb83a6189d7e08cf6d3ba73481f1a69709d9ec7a9c9f681a828446b980252a807931289362a2734f0394e864d62b75781325488961f59889922005ca4195ce1ac98136ebf38a156170165053893663de43ba144737d852b7c78e5a19611e0923f9faad5df7b2064c99034a2363ae0e821d62f5f0f919a9e5ff4a8570c598f9574dd0dd2a0b5ea432b0735bf6148b2a54a2f26cebfef8f04222f469bc3b31035eae60b6521393be37ac8fe393a90a09da177e2d979ac371a998eda67b997c10db40fe000dd6f960be&access_code=AVBN10LH77AQ62NBQA&working_key=0620433A6ABA11E87953E6F204612857`,
    access_code: `AVBN10LH77AQ62NBQA`,
    cancel_url: `https://apistaging.booon.in/api/ccavenue_cancel`,
    redirect_url: `https://apistaging.booon.in/api/ccavenue_success`,
    order_id: `585`,
    merchant_id: `2947789`,
  };*/

  const encodedEncVal = encodeURIComponent(params.enc_val);
  console.log('Encoded Enc Val:', encodedEncVal);
  // merchant_id
  let accces = params?.access_code;

  const _onMessage = event => {
    var getData = event.nativeEvent.data;
    var navUrl = event.nativeEvent.url;
    if (
      getData != null &&
      (navUrl === params.redirect_url || navUrl === params.cancel_url)
    ) {
      //Alert.alert('Success',getData);

      var html1 = getData.toString();
      var htmlArr1 = html1.split(`<tbody>`);
      if (htmlArr1.length > 1) {
        var htmlStr1 = htmlArr1[1];
        var htmlArr2 = htmlStr1.split(`</tbody>`);
        if (htmlArr2.length > 0) {
          var jsonString = htmlArr2[0];
          jsonString = jsonString.replace(/<td>/g, `\"`);
          jsonString = jsonString.replace(/<tr>/g, ``);
          jsonString = jsonString.replace(/<\/tr>/g, `,`);

          jsonString = jsonString.replace(/<\/td>/g, `\" : `);
          jsonString = jsonString.replace(/ : ,/g, `,`);

          if (jsonString.length > 0) {
            jsonString = jsonString.substring(0, jsonString.length - 1);
          }

          jsonString = `{${jsonString}}`;

          var status = 'Unknown Error Occurred';
          try {
            var map = JSON.parse(jsonString);
            status = map['order_status'];
          } catch (error) {
            status = error.toString();
          }

          navigation.navigate('Status', {
            objJson: status,
          });
        }
      }
    }
  };

  const onNavigationStateChange = (navState) => {
    if (navState.url === params.redirect_url || navState.url === params.cancel_url) {

    }
  }

  const jsCode = `    
    var interval = setInterval(function(){
      var sourceCode = window.document.getElementsByTagName('html')[0].outerHTML;
      
      //if(sourceCode.indexOf('shopping with us.')>-1){        
        window.ReactNativeWebView.postMessage(sourceCode);
        clearInterval(interval);
      //}
    },1000);`;

  const loadHtml = () => {
    var html =
      `<html> <head><meta name='viewport' content='width=device-width, initial-scale=1.0'></head> <body onload='document.f.submit();'> <form id='f' name='f' method='post' action='${web_url}'>` +
      `<input type='hidden' name='command' value='${commamd}'/>` +
      `<input type='hidden' name='encRequest' value='c6f829001695d7b7d25937f10dd2f1a7cbcca0af331c992174500fdcdfe8e43f76a963d637951744a3c25b8e136e3b881fc0cfd029edca0ca8a6ca6ca12b42221ccaa4a83082d50e1670c777c3793c6233f01a466cb3472731c529ef5df513d7efac7596e6d2701eeff60fade0b3dea2fb129f46aa534c0aa4dba4dec5032e4fe41034d5012fb5626e630c3e28941a9282ecc26fa5eecbf29cbaefe052dffd95ce3d87e30aa0dcd5e11f5fafa4f998f466fb5876a06a4008fdee1453f8e07e02f05bfe7e853c2f2ca4329c13847df43b0cd06f6213a3db16bef26c61ac149f07d36356da87451a807c1fdbb1c9a5ba1b'/>` +
      `<input  type='hidden' name='access_code' value='${accces}' />`;
    console.log('html', html);
    return html + '</form> </body> </html>';
  };

  const INJECTEDJAVASCRIPT =
    "const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=0.99, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); ";

  // 110001
  const paymentUrl = route.params?.response?.enc_val;

  console.log('============>', params.enc_val);
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'transparent'}}>
      <View style={{flex: 1}}>
        <CustomHeader back title={`Payment`} />
        <WebView
          automaticallyAdjustContentInsets={false}
          source={{
            // uri:paymentUrl

            //uri: params.enc_val
            //  uri: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction&access_code=AVLA00EA83AK67ALKA&encRequest=30bff25ea5c49f9296fd2b9d9f09050798d54e45fcd7090edfcd0ca8469fa5430521c2aa02a5b49be67e52b287628ef85bf415338c6bbf844b732cc288c9941b2ee780dc2ade04d08de53ba6a47f554be9a066caec65c596831e7edb21ad234ce74d9cea4bd4647171e091c9bdf7d8c1550e99e1f6bdc8b812bf55e4a44325b0bd709f722e6b1a50285f54ef6c0502a07bcc8a62219749eb73522553e0518c540ff0e7b71d46e570330b17b9c4f9ba506c42227dc294ad369f49b83db527be43ba8cd36b96be7f88eaf61d984458edb0487a0c7aec71d3f38db75006d5d2b134b72bb08180caa532fb88b788fadb3268129008168451f0a157fc87639954c226'
            //  uri: "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction&encRequest=9822360ab01211504a7a0f0c25de7e78ee336f50f70f44b1ae3cd2699656f8b6b88b1f7d4865761230b3c45ee43eedd942fbe7483de0f2587022594a0c8e553a0b48543c6c6a608f048aede5bfecd03382b053dbe1f31625ee9a23bca862974392c48a17f80c30c7878ffdfa9c69122c2b7af107f63a05ed09f44bf3a8a9338c381d840b11cd2e734b2987c49a0127e93b0400f48690b6b709938239c146ba446e88f219f1af499b758511f9c22c2210dbecee7048e12b18dd66ffa308fe2582&access_code=AVUX68LC83AJ90XUJA&working_key=14C009070858693D42FB299F831343BD"
            html: loadHtml(),
          }}
          // injectedJavaScript={INJECTEDJAVASCRIPT}
          injectedJavaScriptBeforeContentLoaded={pucJavaScript}
          scrollEnabled
          scalesPageToFit={false}
          // onShouldStartLoadWithRequest={handleUrlLoading}

          originWhitelist={['*']}
          injectedJavaScript={jsCode}
          onMessage={_onMessage}
          javaScriptEnabled={true}
          cacheEnabled={true}
          allowFileAccessFromFileURLs={true}
          setSupportMultipleWindows={true}
          domStorageEnabled={true}
          allowUniversalAccessFromFileURLs={true}
         
          onShouldStartLoadWithRequest={request => {
            const {url} = request;
            if (
              url.includes('phonepe://pay?') ||
              url.includes('paytmmp://pay?') ||
              url.includes('tez://upi/pay?') ||
              url.includes('upi://pay?') ||
              url.includes('credpay://upi/pay?')
            ) {
              Linking.openURL(url);
              return false;
            }
            return true;
          }}
          startInLoadingState={true}
          onNavigationStateChange={onNavigationStateChange}
          
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
