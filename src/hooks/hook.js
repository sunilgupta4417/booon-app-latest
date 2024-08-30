import { BASE_URL } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";


 export const getAddressList =  async () => {
    const token = await AsyncStorage.getItem('token');
    const {id} = JSON.parse(await AsyncStorage.getItem('userData'));
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const body = {
      user_id: id,
      primary_address :'1',
    };
    const response = await axios.post(
      `${BASE_URL}/user-address-list`,
      body,
      {headers},
    );
    return response.data;
  }


