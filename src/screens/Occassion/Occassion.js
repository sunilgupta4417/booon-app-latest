import { Dimensions, Image, SafeAreaView, FlatList, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomHeader from '../../components/CustomHeader';
import axios from 'axios';
import { BASE_URL } from '../../config';

const { width: viewportWidth } = Dimensions.get('window');

const Occassion = ({ navigation }) => {
  const [wearCompData, setWearCompData] = useState([]);

  const getWearCategory = async () => {
    const body = {
      get_type: 0
    }
    const response = await axios.post(`${BASE_URL}/category-tags`, body)
    // console.log(response.data,"category-tagsRespo")
    if (response.data.status_code == 200) {
      setWearCompData(response.data.data.tags)
    }
  }
  useEffect(() => { 
    getWearCategory()
  }, [])

  const WearComp = ({ img, title, subtitle, subsubCatData, direction }) => (
    <>
      <TouchableOpacity onPress={() => navigation.navigate('SubCategory', { title: title, subsubCatData: subsubCatData, tag: title})} style={{ flexDirection: direction, width: "96%", height: 110, alignItems: "center", alignSelf: "center", marginTop: 12 }}>
        <Image style={{ width: '50%', height: 110 }} source={{ uri: img }} />
        <View style={{ backgroundColor: "#F0F0F0", flex: 1, height: "100%", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: Platform.OS == 'android' ? '700' : '500', fontFamily: 'Poppins', lineHeight: 21, color: '#000000' }}>{title}</Text>
          <Text style={{ fontSize: 12, fontWeight: "400", lineHeight: 18, fontFamily: 'Poppins', color: '#000000' }}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
      <Image style={{ width: 28, height: 28, position: "absolute", left: '46%', top: '40%' }} source={require('../../assets/Home/arrowR.png')} />
    </>
  )
  const renderItem = ({ item, index }) => (
    <WearComp
      title={item.title}
      subtitle={item.sub_title}
      img={item.image}
      subsubCatData={item.data}
      direction={index % 2 === 0 ? "row" : "row-reverse"}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <CustomHeader title={"Occassions"} wishlist bag />
      <FlatList
        data={wearCompData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

export default Occassion;

const styles = StyleSheet.create({});
