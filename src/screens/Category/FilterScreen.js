import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { Provider as PaperProvider, Checkbox } from 'react-native-paper';
import ButtonComp from '../../components/ButtonComp';
const FilterScreen = ({
  data,
  onOnlyClose,
  initialFilter,
  close,
  appliedFilter
}) => {
  const [selectedCategory, setSelectedCategory] = useState(initialFilter);
  const [price, setPrice] = useState('');
  const [gender, setGender] = useState('');
  const [size, setsize] = useState([]);
  const [subsubcat_id, setsubsubcat_id] = useState([]);
  const [discount_value, setdiscount_values] = useState('');
  const [color, setcolor] = useState([]);
  const [brandname, setbrandname] = useState([]);
  const [short, setshort] = useState(appliedFilter?.short && appliedFilter?.short || '');
  const [screenData, setScreenData] = useState(data || {});
  useEffect(() => {
    if (selectedCategory == 'discount') {
      setdiscount_values(appliedFilter?.discount_value && appliedFilter?.discount_value !== '' ? appliedFilter?.discount_value : '')
    } else if (selectedCategory == 'category') {
      setsubsubcat_id(appliedFilter?.subsubcat_id?.length > 0 ? appliedFilter?.subsubcat_id : []);
    } else if (selectedCategory == 'price') {
      setPrice(appliedFilter?.price !== '' ? appliedFilter?.price : '')
    } else if (selectedCategory == 'gender') {
      setGender(appliedFilter?.gender !== '' ? appliedFilter?.gender : '')
    } else if (selectedCategory == 'size') {
      setsize(appliedFilter?.size?.length > 0 ? appliedFilter?.size : [])
    } else if (selectedCategory == 'color') {
      setcolor(appliedFilter?.color?.length > 0 ? appliedFilter?.color : [])
    } else if (selectedCategory == 'brand') {
      setbrandname(appliedFilter?.brandname?.length > 0 ? appliedFilter?.brandname : [])
    }
  }, [selectedCategory])

  const renderContent = () => {
    const style = {
      color: '#64646D',
      fontFamily:'Poppins-Medium'
    };
    switch (selectedCategory) {
      case 'price': 
        return (
          <View>
            {[...screenData?.price].map(option => (
              <TouchableOpacity
                key={option?.label}
                style={styles.option}
                onPress={() => setPrice(option?.price)}>
                <Text
                  style={{
                    fontFamily: price == option?.price ? 'Poppins-SemiBold' : 'Poppins-Medium',
                    color: price == option?.price ? '#111111' : '#64646D',
                  }}>
                  {option?.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'gender':
        return (
          <View>
            {screenData && [...screenData?.gender].map(option => (
              <TouchableOpacity
                key={option}
                style={styles.option}
                onPress={() => setGender(option)}>
                <Text
                  style={{
                    fontFamily: gender == option ? 'Poppins-SemiBold' : 'Poppins-Medium',
                    color: gender == option ? '#111111' : '#64646D',
                  }}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'discount':
        return (
          <View>
            {[...screenData?.discount].map(option => (
              <TouchableOpacity
                key={option?.label}
                style={styles.option}
                onPress={() => setdiscount_values(option?.discount_value)}>
                <Text
                  style={{
                    // fontWeight:
                    //   discount_value == option?.discount_value ? '600' : '400',
                      fontFamily: discount_value == option?.discount_value ? 'Poppins-SemiBold' : 'Poppins-Medium',
                    color:
                      discount_value == option?.discount_value
                        ? '#111111'
                        : '#64646D',
                  }}>
                  {option?.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'size':
        return (
          <ScrollView>
            {[...screenData?.size].map(option => (
              <View key={option?.name} style={styles.option}>
                <Checkbox
                  status={size.includes(option?.name) ? 'checked' : 'unchecked'}
                  // onPress={() => {
                  //   let sizefilter = [...size]
                  //   sizefilter.push(option?.name)
                  //   setsize(sizefilter)
                  // }}
                  onPress={() => {
                    let sizeFilter = [...size]
                    const sizeIndex = sizeFilter.indexOf(option?.name);
                    if (sizeIndex !== -1) {
                      sizeFilter.splice(sizeIndex, 1);
                    } else {
                      sizeFilter.push(option?.name);
                    }
                    setsize(sizeFilter)
                  }}
                />
                <Text style={style}>{option?.name}</Text>
              </View>
            ))}
          </ScrollView>
        );
      case 'color':
        return (
          <ScrollView>
            {[...screenData?.color].map(colors => (
              <View key={colors?.name} style={styles.option}>
                <Checkbox
                  status={color.includes(colors?.name) ? 'checked' : 'unchecked'}
                  onPress={() => {
                    let colorsfilter = [...color];
                    const colorIndex = colorsfilter.indexOf(colors?.name);
                    if (colorIndex !== -1) {
                      // Color is already present, so remove it
                      colorsfilter.splice(colorIndex, 1);
                    } else {
                      // Color is not present, so add it
                      colorsfilter.push(colors?.name);
                    }
                    setcolor(colorsfilter);
                  }}
                />
                <Text style={[style,{justifyContent:'center'}]}>
                  {/* <View style={{ backgroundColor: colors?.name.toLowerCase(), width: 30, height: 20,marginRight:10 }}></View> */}
                  {colors?.name}</Text>
              </View>
            ))}
          </ScrollView>
        );

      case 'category':
        return (
          <ScrollView>
            {[...screenData?.category].map(category => (
              <View key={category?.cat_id} style={styles.option}>
                <Checkbox
                  status={subsubcat_id.includes(category?.cat_id) ? 'checked' : 'unchecked'}
                  onPress={() => {
                    let subsubcatIdFilter = [...subsubcat_id];
                    const subCatIndex = subsubcatIdFilter.indexOf(category?.cat_id);
                    if (subCatIndex !== -1) {
                      subsubcatIdFilter.splice(subCatIndex, 1);
                    } else {
                      subsubcatIdFilter.push(category?.cat_id);
                    }
                    setsubsubcat_id(subsubcatIdFilter);
                  }}
                />
                <Text style={style}>{category?.name}</Text>
              </View>
            ))}
          </ScrollView>
        );
      case 'brand':
        return (
          <ScrollView>
            {[...screenData?.brand].map(brand => (
              <View key={brand?.brandname} style={styles.option}>
                <Checkbox
                  status={
                    brandname.includes(brand?.brandname) ? 'checked' : 'unchecked'
                  }
                  onPress={() => {
                    let brandFilter = [...brandname]
                    const brandIndex = brandFilter.indexOf(brand?.brandname);
                    if (brandIndex !== -1) {
                      brandFilter.splice(brandIndex, 1);
                    } else {
                      brandFilter.push(brand?.brandname);
                    }
                    setbrandname(brandFilter);
                  }}
                />
                <Text style={style}>{brand?.brandname}</Text>
              </View>
            ))}
          </ScrollView>
        );
      // Add cases for other categories like 'Gender', 'Size', 'Brand', 'Price' with their respective options
      default:
        return <View />;
    }
  };
  const onComplete = () => {
    const payload = {
      brandname,
      color,
      size,
      gender,
      discount_value,
      price,
      subsubcat_id,
      short
    };

    close(payload);
  };

  const onClearAll = () => {
    setGender('');
    setsize([]);
    setdiscount_values('');
    setcolor([]);
    setbrandname([]);
    setPrice('');
    setshort('');
    setsubsubcat_id([]);
    close({});
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onOnlyClose}>
            <Image
              style={{ width: 32, height: 32, marginRight: 10 }}
              source={require('../../assets/cross.png')}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>{selectedCategory == 'sort' ? 'Sort' : 'Filter'}</Text>
        </View>
        <View style={styles.content}>
          <ScrollView style={styles.leftPanel}>
            {Object.keys(screenData).map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategory,
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category
                      ? styles.selectedText
                      : styles.unselectedText,
                  ]}>
                  {category}
                </Text>
                {selectedCategory === category && (
                  <View style={styles.indicator} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.rightPanel}>{renderContent()}</View>
        </View>
        <View style={styles.footer}>
          <ButtonComp
            onPress={onClearAll}
            color="#FFFFFF"
            bdrColor="#DEDEE0"
            txtColor="#111111"
            title="Clear All"
            width="40%"
            padding={1}
          />
          <ButtonComp
            onPress={onComplete}
            color="#21212F"
            bdrColor="#21212F"
            txtColor="#FFFFFF"
            title="Apply"
            width="40%"
            padding={1}
          />
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
};

export default FilterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DEDEE0',
  },
  headerText: {
    fontSize: 16,
    // fontWeight: Platform.OS == 'android' ? '700' : '500',
    fontFamily: 'Poppins-SemiBold',
    color: '#000000',
  },
  content: {
    flexDirection: 'row',
    flex: 1,
  },
  leftPanel: {
    width: '25%',
    borderRightWidth: 1,
    borderRightColor: '#DEDEE0',
    // backgroundColor: '#F8F8F8',
  },
  rightPanel: {
    width: '75%',
    paddingHorizontal: 15,
    paddingTop: 5
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingRight: 0,
  },
  selectedCategory: {
    // backgroundColor: '#F0F0F0',
  },
  indicator: {
    width: 8,
    height: 32,
    backgroundColor: '#21212F',
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 14,
    // fontWeight: Platform.OS == 'android' ? '700' : '500',
    textTransform: 'capitalize',
    fontFamily: 'Poppins-Medium',
    color: '#64646D',
  },
  selectedText: {
    color: '#111111',
    fontSize: 14,
    // fontWeight: Platform.OS == 'android' ? '700' : '500',
    fontFamily: 'Poppins-SemiBold',
  },
  unselectedText: {
    color: '#64646D',
    fontSize: 14,
    // fontWeight: Platform.OS == 'android' ? '700' : '500',
    // fontFamily: 'Poppins',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#00000026',
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderColor: '#DEDEE0',
    borderWidth: 1,
    borderRadius: 24,
  },
  clearButtonText: {
    color: '#21212F',
  },
  //   applyButton: {
  //     width: '60%',
  //     borderRadius: 24,
  //   },
});
