import React, { useState } from 'react';
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
  console.log('-=-=-=-==', appliedFilter);
  
  const [selectedCategory, setSelectedCategory] = useState(initialFilter);
  // const appliedFilterData = appliedFilter
  const [price, setPrice] = useState('');
  const [gender, setGender] = useState(false);
  const [sizeFilters, setSizeFilters] = useState({});
  const [categoryFilter, setcategoryFilter] = useState({});
  const [discountFilter, setDiscountFilters] = useState('');
  const [colorFilters, setColorFilters] = useState({});
  const [brandFilters, setBrandFilters] = useState({});
  const [screenData, setScreenData] = useState(data || {}); 

  const renderContent = () => {
    const style = {
      color: '#64646D',
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
                    fontWeight: price == option?.price ? '600' : '400',
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
                    fontWeight: gender == option ? '600' : '400',
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
            {(screenData?.discount || []).map(option => (
              <TouchableOpacity
                key={option?.label}
                style={styles.option}
                onPress={() => setDiscountFilters(option?.discount_value)}>
                <Text
                  style={{
                    fontWeight:
                      discountFilter == option?.discount_value ? '600' : '400',
                    color:
                      discountFilter == option?.discount_value
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
          <View>
            {[...screenData?.size].map(option => (
              <View key={option?.name} style={styles.option}>
                <Checkbox
                  status={sizeFilters[option?.name] ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setSizeFilters(prev => ({
                      ...prev,
                      [option?.name]: !prev[option?.name],
                    }));
                  }}
                />
                <Text style={style}>{option?.name}</Text>
              </View>
            ))}
          </View>
        );
      case 'color':
        return (
          <ScrollView>
            {[...screenData?.color].map(color => (
              <View key={color?.name} style={styles.option}>
                <Checkbox
                  status={colorFilters[color?.name] ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setColorFilters(prev => ({
                      ...prev,
                      [color?.name]: !prev[color?.name],
                    }));
                  }}
                />
                <Text style={style}>
                  <Text style={{backgroundColor:color.name,width:40,height:30}}></Text>
                  {color?.name}</Text>
              </View>
            ))}
          </ScrollView>
        );

      // colorFilters[color?.name] ? 'checked' :
      case 'category':
        return (
          <ScrollView>
            {[...screenData?.category].map(category => (
              <View key={category?.name} style={styles.option}>
                <Checkbox
                  status={categoryFilter[category?.name] ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setcategoryFilter(prev => ({
                      ...prev,
                      [category?.name]: !prev[category?.name],
                    }));
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
                    brandFilters[brand?.brandname] ? 'checked' : 'unchecked'
                  }
                  onPress={() => {
                    setBrandFilters(prev => ({
                      ...prev,
                      [brand?.brandname]: !prev[brand?.brandname],
                    }));
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
      brandFilters,
      colorFilters,
      sizeFilters,
      gender,
      discountFilter,
      price,
      categoryFilter
    };

    close(payload);
  };

  const onClearAll = () => {
    setGender({});
    setSizeFilters({});
    setColorFilters({});
    setBrandFilters({});
    setScreenData({});
    setcategoryFilter({})
    setGender(false)
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
            <Text style={styles.headerText}>{selectedCategory == 'sort' ? 'Sort':'Filter'}</Text>
          </View>
          <View style={styles.content}>
            <ScrollView style={styles.leftPanel}>
              {selectedCategory == 'sort' ?
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    styles.selectedCategory,
                  ]}>
                  <Text
                    style={[
                      styles.categoryText, styles.selectedText
                    ]}>
                    {'Sort'}
                  </Text>
                  <View style={styles.indicator} />
                </TouchableOpacity>
                : <>
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
                </>}
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
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    // fontFamily: 'Poppins',
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
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    textTransform: 'capitalize',
    // fontFamily: 'Poppins',
    color: '#64646D',
  },
  selectedText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: Platform.OS == 'android' ? '700' : '500',
    // fontFamily: 'Poppins',
  },
  unselectedText: {
    color: '#64646D',
    fontSize: 14,
    fontWeight: Platform.OS == 'android' ? '700' : '500',
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
