/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {Image, LogBox, StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from './src/screens/onboarding/SplashScreen';
import GetStarted from './src/screens/onboarding/GetStarted';
import SelectLocation from './src/screens/onboarding/SelectLocation';
import SearchLocation from './src/screens/onboarding/SearchLocation';
import HomeScreen from './src/screens/Home/HomeScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Category from './src/screens/Category/Category';
import Occassion from './src/screens/Occassion/Occassion';
import Account from './src/screens/Account/Account';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Address from './src/screens/Account/Address';
import Wishlist from './src/screens/Account/Wishlist';
import AddAddress from './src/screens/Account/AddAddress';
import SubCategory from './src/screens/Category/SubCategory';
import SubCategory2 from './src/screens/Category/SubCategory2';
import Login from './src/screens/onboarding/Login';
import OTPScreen from './src/screens/onboarding/OTPScreen';
import ProductScreen from './src/screens/Category/ProductScreen';
import BagScreen from './src/screens/Account/BagScreen';
import {Provider} from 'react-redux';
import {store} from './src/redux/store/Store';
import WebViewComp from './src/components/WebViewComp';
import OrderSuccess from './src/screens/orders/OrderSuccess';
import {getUniqueId, getManufacturer} from 'react-native-device-info';
import WebViewPage from './src/screens/Account/webview_page';
import SearchProduct from './src/screens/Home/SearchProduct';
import {useMMKVString} from 'react-native-mmkv';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const queryClient = new QueryClient();

// OrderSuccess
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AccountStack() {
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen
        name="Account"
        component={Account}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Address"
        component={Address}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

function MyTabs() {
  return (
    <Tab.Navigator >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarShowLabel:false,
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <View
              style={{alignItems: 'center', justifyContent: 'center', top: 2}}>
              <Image
                source={focused ? require('./src/assets/Home/Home-dark.png'): require('./src/assets/Home/home-outline.png')}
                style={{width: 18, height: 18, resizeMode:'contain'}}
              />
              <Text style={{fontSize:14,fontWeight:focused?'700':'500',color:'#000'}}>Home</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Category"
        component={Category}
        options={{
          headerShown: false,
          tabBarShowLabel:false,
          tabBarIcon: ({focused}) => (
            <View
              style={{alignItems: 'center', justifyContent: 'center', top: 2}}>
              <Image
                source={focused ? require('./src/assets/Home/Cat-dark.png'): require('./src/assets/Home/Cat-Outline.png')}
                style={{width: 18, height: 18, resizeMode:'contain'}}
              />
              <Text style={{fontSize:14,fontWeight:focused?'700':'500',color:'#000'}}>Category</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Occassion"
        component={Occassion}
        options={{
          headerShown: false,
          tabBarShowLabel:false,
          tabBarIcon: ({focused}) => (
            <View
              style={{alignItems: 'center', justifyContent: 'center', top: 2}}>
              <Image
                source={focused ? require('./src/assets/Home/Occision-dark.png'): require('./src/assets/Home/Occasion-outline.png')}
                style={{width: 18, height: 18, resizeMode:'contain'}}
              />
              <Text style={{fontSize:14,fontWeight:focused?'700':'500',color:'#000'}}>Occasion</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountStack}
        options={{
          headerShown: false,
          tabBarShowLabel:false,
          tabBarIcon: ({focused}) => (
            <View
              style={{alignItems: 'center', justifyContent: 'center', top: 2}}>
              <Image
                source={focused ? require('./src/assets/Home/user-dark.png'): require('./src/assets/Home/user-outline.png')}
                style={{width: 18, height: 18, resizeMode:'contain'}}
              />
              <Text style={{fontSize:14,fontWeight:focused?'700':'500',color:'#000'}}>Account</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
function Stacks() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="WebViewPage"
        component={WebViewPage}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="GetStarted"
        component={GetStarted}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SelectLocation"
        component={SelectLocation}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SearchLocation"
        component={SearchLocation}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="HomeScreen"
        component={MyTabs}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SearchProduct"
        component={SearchProduct}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccess}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Wishlist"
        component={Wishlist}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddAddress"
        component={AddAddress}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SubCategory"
        component={SubCategory}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SubCategory2"
        component={SubCategory2}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="OTPScreen"
        component={OTPScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ProductScreen"
        component={ProductScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BagScreen"
        component={BagScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="WebViewComp"
        component={WebViewComp}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  LogBox.ignoreAllLogs();

  const uniqueID = async () => {
    const id = await getUniqueId();
    // alert(JSON.stringify(id))
    global.deviceId = id;
  };

  useEffect(() => {
    uniqueID();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <NavigationContainer>
          <Stacks />
        </NavigationContainer>
      </Provider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  
});

export default App;
