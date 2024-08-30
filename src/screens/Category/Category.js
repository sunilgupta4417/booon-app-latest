import { Dimensions, FlatList, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomHeader from '../../components/CustomHeader';
import Accordion from 'react-native-collapsible/Accordion';
import axios from 'axios';
import { BASE_URL } from '../../config';

const { width: viewportWidth, height } = Dimensions.get('window');

const Category = ({navigation}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeSections, setActiveSections] = useState([]);
  const [catData, setCatData] = useState([]);

  const getCatData = async () => {
    const body = {
      get_type: 1
    };
    const response = await axios.post(`${BASE_URL}/category-tags`, body);
    if(response.data.status_code === 200) {
      setCatData(response.data.data.category);
    }
  };

  useEffect(() => {
    getCatData();
  }, []);

  const _renderHeader = (section, index, isActive) => {
    return (
      <View key={index} style={styles.headerContainer}>
        <ImageBackground style={styles.headerBackground} source={{uri: section.image}}>
          <View style={styles.overlay} />
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>{section.name}</Text>
            {isActive ?
              <Image style={styles.arrowIcon} source={require('../../assets/Category/uparr.png')} /> :
              <Image style={styles.arrowIcon} source={require('../../assets/Category/downarr.png')} />
            }
          </View>
        </ImageBackground>
      </View>
    );
  };

  const _renderContent = ({sub_sub_category, cat_id}) => {
    const AccordionItem = ({item}) => (
      <TouchableOpacity 
        // onPress={() => console.log('-=-=-=-',catData[selectedIndex].cat_id, cat_id, item.cat_id)} 
        onPress={() => {
          const params = {
            title: item.name,
            cat_id: catData[selectedIndex].cat_id ,
            subcat_id: cat_id ,
            subsubcat_id: item.cat_id,
          };
          navigation.navigate('SubCategory2', params);
        }}
        style={{width: viewportWidth - 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#DEDEE0', backgroundColor: '#F3F3F6', padding: 10, marginLeft: 0}}
      >
        <View style={{flexDirection: "row"}}>
          <Image style={{height: 56, width: 56, margin: 10}} source={{uri: item.image}} />
          <Text style={styles.contentText}>{item.name}</Text>
        </View>
        <Image style={{height: 10, width: 5, margin: 5}} source={require('../../assets/Category/rightarr.png')} />
      </TouchableOpacity>
    );

    return (
      <View style={styles.contentContainer}>
        <FlatList
          data={sub_sub_category}
          renderItem={AccordionItem}
        />
      </View>
    );
  };

  const _updateSections = (activeSections) => {
    setActiveSections(activeSections);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <CustomHeader title={"Categories"} search wishlist bag />
        <View style={styles.toggleTabContainer}>
          {catData.length > 0 && catData.map((e, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => setSelectedIndex(index)} 
              style={[styles.tab, selectedIndex === index && styles.activeTab]}
            >
              <Text style={[styles.tabText, selectedIndex === index && styles.activeTabText]}>{e.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {catData.length > 0 && (
          <Accordion
            sections={catData[selectedIndex].sub}
            activeSections={activeSections}
            renderHeader={_renderHeader}
            renderContent={_renderContent}
            onChange={_updateSections}
            underlayColor="transparent" // Ensure underlay color is transparent
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default Category;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  toggleTabContainer: {
    flexDirection: 'row',
    justifyContent: "space-evenly",
    borderWidth: 1,
    borderColor: '#DEDEE0',
    borderRadius: 20,
    width: "90%",
    alignSelf: "center",
    height: 40,
    marginVertical: 10,
  },
  tab: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  activeTab: {
    backgroundColor: '#000000',
  },
  tabText: {
    color: 'black',
    alignSelf: 'center',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins',
    lineHeight: 16,
  },
  activeTabText: {
    color: 'white',
  },
  headerContainer: {
    marginTop: 10,
    width: viewportWidth,
  },
  headerBackground: {
    width: viewportWidth - 40,
    alignSelf: "center",
    borderWidth: 0,
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    fontFamily: 'Poppins',
    color: '#ffffff',
  },
  arrowIcon: {
    height: 5,
    width: 10,
  },
  contentContainer: {
    backgroundColor: '#ffffff',
    padding: 0,
    width: '90%',
    alignSelf: 'center',
    borderWidth: 0,
  },
  contentText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    fontFamily: 'Poppins',
    color: '#111111',
    alignSelf: 'center',
  },
});
