import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import CustomHeader from '../../components/CustomHeader';
import { responsiveWidth } from '../../utils';
import FilterScreen from './FilterScreen';
import FilterModal from 'react-native-modal'
import axios from 'axios';
import { BASE_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
const width = Dimensions.get('window').width;

const SubCategory2 = ({ navigation, route: { params } }) => {
  const dispatch = useDispatch();
  const filterSort = useRef({});
  const [filterTypeRef, setfilterTypeRef] = useState('discount');
  const [sizeModal, setSizeModal] = useState(false);
  const [genderModal, setGenderModal] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [gender, setGender] = useState(null);
  const [imageBase, setImageBase] = useState('');
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [subcategory, setSubCategory] = useState([]);
  const [sortModal, setSortModal] = useState(false);
  const subCategoryId = useRef(params.subsubcat_id);
  const [filterData, setFilterData] = useState({});
  const [filterObjToData, setfilterObjToData] = useState(null)
  const [noData, setnoData] = useState('')
  const [filterModal, setFilterModal] = useState(false);
  const [AppliedFilter, setAppliedFilter] = useState({})
  const sortFiterlist = [
    { lable: 'Newest First', value: 'new' },
    { lable: 'Popularity', value: 'popular' },
    { lable: 'Price - High to Low', value: 'high_to_low' },
    { lable: 'Price - Low to High', value: 'low_to_high' }
  ];
  const [isCategorySelected, setIsCategorySelected] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState();
  const updateIndexStatus = useRef({});
  const [showButton, setShowButton] = useState(false);
  const flatListRef = useRef(null);  // Ref for FlatList

  useFocusEffect(
    useCallback(() => {
      getCount()
    }, []),
  );

  useEffect(() => {
    const getAllLists = async () => {
      getCount()
      await getFilter();
      await getSubCategory();
      await getProductList(1);
    }
    getAllLists();
  }, []);

  const getCount = async () => {
    const { id } = JSON.parse(await AsyncStorage.getItem('userData'));
    const body = {
      user_id: id,
      device_id: global.deviceId,
    };
    const response = await axios.post(`${BASE_URL}/counting`, body);
    dispatch({ type: 'BAG_COUNT', payload: response.data });
  };

  // Roman numeral conversion function
  const romanToDecimal = (roman) => {
    const romanNumerals = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let result = 0, i;
    for (i in romanNumerals) {
      while (roman.indexOf(i) === 0) {
        result += romanNumerals[i];
        roman = roman.replace(i, '');
      }
    }
    return result;
  };

  // Function to sort sizes
  // const sortSizes = (sizes) => {
  //   const sizeMap = { XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6, '3XL': 7, '4XL': 8, '5XL': 9, '6XL': 10 };
  //   const numericSizes = sizes.filter(size => !isNaN(size.name)).map(size => parseInt(size.name));
  //   const romanSizes = sizes.filter(size => sizeMap[size.name] || size.name.includes('XL'));
  //   numericSizes.sort((a, b) => a - b);
  //   romanSizes.sort((a, b) => sizeMap[a.name] - sizeMap[b.name]);
  //   return [
  //     ...numericSizes.map(size => ({ name: size.toString() })),
  //     ...romanSizes
  //   ];
  // };

  const sortSizes = (sizes) => {
    const sizeMap = { XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6, '3XL': 7, '4XL': 8, '5XL': 9, '6XL': 10 };

    // Helper function to extract the numeric value from size strings like "10-11Y" or "10Y"
    const getSizeValue = (size) => {
      const matches = size.match(/\d+/g);  // Find all digits in the string
      return matches ? parseInt(matches[0], 10) : 0;  // Return the first matched number
    };

    // Separate numeric sizes, Roman numeral sizes, and kids' sizes (ending in 'Y')
    const numericSizes = sizes.filter(size => !isNaN(size.name)).map(size => parseInt(size.name));
    const romanSizes = sizes.filter(size => sizeMap[size.name] || size.name.includes('XL'));
    const kidsSizes = sizes.filter(size => size.name.includes('Y'));

    // Sort the numeric sizes
    numericSizes.sort((a, b) => a - b);

    // Sort the Roman numeral sizes based on the sizeMap
    romanSizes.sort((a, b) => sizeMap[a.name] - sizeMap[b.name]);

    // Sort kids' sizes by extracting numeric values from the string
    kidsSizes.sort((a, b) => getSizeValue(a.name) - getSizeValue(b.name));

    // Return the merged sorted array
    return [
      ...numericSizes.map(size => ({ name: size.toString() })),  // Convert numeric sizes back to objects
      ...romanSizes,                                             // Add sorted Roman numeral sizes
      ...kidsSizes                                               // Add sorted kids' sizes
    ];
  };

  const getFilter = async () => {
    let url = `${BASE_URL}/app-filter?seller_id=${global.sellerId}`;
    if (params?.cat_id) {
      url = url + `&cat_id=${params.cat_id}`;
    }

    if (params?.subcat_id) {
      url = url + `&subcat_id=${params.subcat_id}`;
    }

    if (subCategoryId.current) {
      url = url + `&subsubcat_id=${subCategoryId.current}`;
    }
    console.log("body of Get filter in mens =>> " + url);
    const res = await axios.get(url);
    if (res?.data) {
      console.log("Size array => " + JSON.stringify(res?.data?.size));
      const sortedSizes = sortSizes(res?.data?.size);
      res.data.size = sortedSizes;
      setFilterData(res?.data);
    }
    let filterObjToData = Object.keys(res?.data);
    setfilterObjToData(filterObjToData)
  };

  const getSubCategory = async () => {
    const savedToken = await AsyncStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${savedToken}`,
    };
    const paramsData = {
      seller_id: global.sellerId,
      ...(params.cat_id && { main_id: params.cat_id }),
      ...(params.subcat_id && { subcat_id: params.subcat_id }),
      ...(params.subsubcat_id && { subsubcat_id: params.subsubcat_id }),
    };
    const response = await axios.post(
      `${BASE_URL}/sub-sub-category`,
      paramsData,
      { headers },
    );
    const res = await response.data;
    setSubCategory(res?.data || []);

  };

  const renderSubCategory = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductScreen', { item: item })}
      style={{ marginVertical: 5, marginLeft: 10 }}>
      <Image
        style={{ width: responsiveWidth(190), height: responsiveWidth(240) }}
        source={{ uri: `${imageBase}${item.seller_id}/${item.image}` }}
      />
      <View style={{ width: responsiveWidth(190), padding: 5 }}>
        <Text style={styles.itemName}>{item.brandname}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{item.name}</Text>
        <View
          style={{
            flexDirection: 'row',
            // justifyContent: 'space-between',
            width: '84%',
          }}>
          <Text style={styles.itemName}>
            ₹{parseInt(item.sellprice) + '  '}
          </Text>
          <Text style={[styles.subtitle, { textDecorationLine: 'line-through' }]}>
            ₹{parseInt(item.costprice) + ' '}
          </Text>
          <Text style={styles.subtitle}> {item.discount}% Off</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // gender

  const handleLoadMore = () => {
    if (!isLoading && hasMoreData) {
      setPage(prevPage => {
        const newPage = prevPage + 1;
        getProductList(newPage);
        return newPage;
      });
    }
  };

  const getProductList = async (pageNum, no_of_item = 16) => {
    setIsLoading(true)
    let body = {
      page: pageNum,
      ...(params.tag && { tags: params.tag }),
      ...(params.bannerData?.type && { type: params.bannerData?.type }),
      ...(params.bannerData?.discount_value && { discount_value: params.bannerData?.discount_value }),
      ...(params.cat_id && { cat_id: params.cat_id }),
      ...(params.subcat_id && { subcat_id: params.subcat_id }),
      ...(subCategoryId.current && { subsubcat_id: subCategoryId.current }),
      ...(params.brandname && { brandname: params.brandname }),
      ...(gender !== null && { gender: gender }),
      seller_id: global.sellerId,
      ...filterSort.current,
    };

    if (no_of_item) {
      body.no_of_item = no_of_item;
    }

    if (body.discount_value && body.discount_value !== '0') {
      body.type = 'discount'
    }
    console.log("body of Get product in mens =>> " + JSON.stringify(body));
    const response = await axios.post(`${BASE_URL}/product-list`, body);
    if (response.status === 200) {
      setIsLoading(false)
      setImageBase(global.imageThumbPath);
      if (pageNum === 1) {
        setSubCategoryData(response.data.product.data);
        setHasMoreData(true);
        setIsLoading(false)
        setnoData('')
        return;
      }
      if (response.data.product.data.length > 0) {
        setSubCategoryData(prevData => [
          ...prevData,
          ...response.data.product.data,
        ]);
        setHasMoreData(true);
        setnoData('')
      } else {
        setnoData('No Data')
        setHasMoreData(false);
      }
    } else {
      setIsLoading(false)
    }
  };

  const FilterComp = ({ name, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.row,
        {
          borderWidth: 1,
          borderColor: '#DEDEE0',
          borderRadius: 20,
          alignItems: 'center',
          paddingHorizontal: 8,
          padding: 4,
          marginLeft: 10,
        },
      ]}>
      <Text style={styles.filterName}>{name}</Text>
      <Image
        style={{ height: 6, width: 10, margin: 6 }}
        source={require('../../assets/Home/down.png')}
      />
    </TouchableOpacity>
  );

  const toggleSize = size => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleSelect = (item, index) => {
    let tempValue = {};
    tempValue.isCategorySelected = true;
    tempValue.selectedCategoryIndex = index;
    updateIndexStatus.current = tempValue;
    subCategoryId.current = item?.cat_id;
    let category = { subsubcat_id: [item?.cat_id] }
    closeFilterApply({ ...AppliedFilter, ...category });

    // try {
    //   flatListRef.current?.scrollToIndex({ animated: false, index });
    // } catch (error) {
    //   console.warn('Scroll to index failed', error);
    // }
  };

  const renderHeaderCat = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => {
        // setSelectedCategoryIndex(index);
        // setIsCategorySelected(!isCategorySelected);
        handleSelect(item, index);
      }}
      style={{
        alignItems: 'center',
        width: 80,
        borderWidth: 0,
        paddingBottom: 10,
      }}>
      <Image
        style={{
          height: 64,
          width: 64,
          borderRadius: 37,
          borderWidth: 3,
          borderColor: updateIndexStatus.current.isCategorySelected && index === updateIndexStatus.current.selectedCategoryIndex ? "black" : "transparent",
          padding: 5,
          margin: 5, // Adjusted margin for spacing
        }}
        source={{ uri: item.image }}
      />
      <Text
        numberOfLines={1}
        style={{
          fontSize: updateIndexStatus.current.isCategorySelected && index === updateIndexStatus.current.selectedCategoryIndex ? 12.5 : 12, // Smaller text to fit in reduced height
          fontWeight: updateIndexStatus.current.isCategorySelected && index === updateIndexStatus.current.selectedCategoryIndex ? "bold" : '400',
          lineHeight: 18,
          fontFamily: 'Poppins',
          color: '#212121',
        }}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const FilterListing = () => {
    return (
      <>
        {filterObjToData && filterObjToData.length > 0 && filterObjToData.map(item => {
          if (item == 'discount') {
            return (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setfilterTypeRef('discount');
                  setFilterModal(true);
                }}
                style={[
                  styles.row,
                  {
                    borderWidth: 1,
                    borderColor: '#DEDEE0',
                    borderRadius: 20,
                    alignItems: 'center',
                    paddingHorizontal: 8,
                    padding: 4,
                  },
                ]}>
                <Text style={styles.filterName}>{'Filter'}</Text>
                <Image
                  style={{ height: 22, width: 22, margin: 2 }}
                  source={require('../../assets/filter.png')}
                />
              </TouchableOpacity>
            );
          }
        })}
        <FilterComp
          name={'Sort by'}
          onPress={() => {
            setfilterTypeRef('sort');
            setSortModal(true);
          }}
        />
        {filterObjToData && filterObjToData.length > 0 && filterObjToData.map(item => {
          if (item == 'gender') {
            return (
              <FilterComp
                key={item}
                name={'Gender'}
                onPress={() => {
                  setfilterTypeRef('gender');
                  setGenderModal(true);
                }}
              />
            );
          }
          if (item == 'size') {
            return (
              <FilterComp
                key={item}
                name={'Size'}
                onPress={() => {
                  setfilterTypeRef('size');
                  setSizeModal(true);
                }}
              />
            );
          }
        })}
      </>
    );
  };

  const _handleGenderFilter = async (genderVAl) => {
    setGender(genderVAl)
    let genders = { gender: genderVAl }
    setGenderModal(false)
    closeFilterApply({ ...AppliedFilter, ...genders });
  }

  const _handleSizeFIlter = () => {
    let size = { size: selectedSizes }
    setSizeModal(false)
    closeFilterApply({ ...AppliedFilter, ...size })
  }

  const _handleSortBy = (sort) => {
    setSortBy(sort);
    let short = { short: sort }
    setSortModal(false)
    closeFilterApply({ ...AppliedFilter, ...short })
  }

  const closeFilterApply = async (value) => {
    if (Object.keys(value).length > 0) {
      setAppliedFilter(value)
      let filterValue = {};
      if (value?.brandname?.length) {
        filterValue.brandname = value.brandname.join(',');
      }

      if (value?.color?.length) {
        filterValue.color = value.color.join(',')
      }

      if (value?.subsubcat_id?.length) {
        filterValue.subsubcat_id = value.subsubcat_id.join(',');
      }

      if (value?.gender && value?.gender !== '') {
        filterValue.gender = value.gender;
      }

      if (value?.short && value?.short !== '') {
        filterValue.short = value.short;
      }

      if (value?.size?.length) {
        setSelectedSizes(value?.size)
        filterValue.size = value.size.join(',');
      }

      if (value?.discount_value && (value?.discount_value !== '' || value?.discount_value !== undefined)) {
        filterValue.discount_value = value?.discount_value;
      }

      if (value?.price && value?.price !== '') {
        filterValue.price = value?.price;
      }
      if (value?.brandname?.length ||
        value?.color?.length ||
        value?.subsubcat_id?.length ||
        value?.gender && value?.gender !== '' ||
        value?.short && value?.short !== '' ||
        value?.size?.length ||
        value?.discount_value && (value?.discount_value !== '' ||
          value?.discount_value !== undefined) ||
        value?.price && value?.price !== '') {
        filterSort.current = filterValue;
        getProductList(1);
        await getFilter();
      }
      setFilterModal(false);
    } else {
      filterSort.current = {};
      setFilterModal(false);
      setAppliedFilter({});
      // getProductList(1);
      // await getFilter();
    }
  }

  // Function to handle scroll to top
  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  // Function to track scroll position
  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    if (scrollOffset > 600) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={params.title} back wishlist bag />
      <FlatList
        ref={flatListRef} // Reference the FlatList
        data={subCategoryData}
        renderItem={renderSubCategory}
        numColumns={2}
        style={{ borderWidth: 0 }}
        keyExtractor={(item, index) => index + ''}
        onEndReachedThreshold={0.7}
        onScroll={handleScroll}  // Track scroll position
        onEndReached={({ distanceFromEnd }) => {
          if (distanceFromEnd > 0.1) {
            console.log("Value is distanceFromEnd =>> " + distanceFromEnd);
            handleLoadMore();
          }
        }}
        ListHeaderComponent={() => (
          <>
            <View style={params.bannerData || params.brandname || params.height ? {} : { height: 100, }}>
              <FlatList
                data={subcategory}
                renderItem={renderHeaderCat}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()} // Ensure unique key
              />
            </View>
            <View
              style={{
                width: width,
                backgroundColor: 'white',
              }}>
              <View
                style={[
                  styles.row,
                  {
                    paddingBottom: 15,

                    paddingTop: 6,
                    backgroundColor: 'white',
                    paddingLeft: 14,
                  },
                ]}>
                <FilterListing />
              </View>
            </View>
          </>
        )}
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            subCategoryData.length === 0 && (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                }}>
                <Text>{noData}</Text>
              </View>
            )
          )
        }
      />

      {showButton && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={scrollToTop}
        >
          <Image
            source={require('../../assets/backW.png')}  // Replace with your arrow image
            style={[styles.buttonIcon, { transform: [{ rotate: '90deg' }] }]}
          />
        </TouchableOpacity>
      )}

      {/* Sort By Filter! */}
      <FilterModal
        isVisible={sortModal}
        onBackButtonPress={() => {
          setSortModal(!sortModal);
        }}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        animationInTiming={500}
        animationOutTiming={500}
        style={{ justifyContent: "flex-end", margin: 0, }}>
        <View style={{ backgroundColor: '#fff', width: '100%', margin: 0, padding: 15, }}>
          <View style={[styles.modalContainer]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSortModal(false)}>
                <Image
                  style={styles.modalClose}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Sort By</Text>
            </View>
            <View style={styles.modalOptions}>
              {sortFiterlist.map(sort => (
                <TouchableOpacity
                  onPress={() => _handleSortBy(sort.value)}
                  key={sort.value}
                  style={styles.option}>
                  <Text
                    style={{
                      marginLeft: 16,
                      color: sortBy == sort.value ? '#111111' : '#64646D',
                      fontWeight: sortBy == sort.value ? '600' : '400',
                    }}>
                    {sort.lable}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </FilterModal>
      {/* Gender Filter! */}
      <FilterModal
        isVisible={genderModal}
        onBackButtonPress={() => {
          setGenderModal(!genderModal);
        }}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        animationInTiming={500}
        animationOutTiming={500}
        style={{ justifyContent: "flex-end", margin: 0, }}>
        <View style={{ backgroundColor: '#fff', width: '100%', margin: 0, padding: 15, }}>
          <View
            style={[styles.modalContainer]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setGenderModal(false)}>
                <Image
                  style={styles.modalClose}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Gender</Text>
            </View>
            <View style={[styles.modalOptions, { paddingTop: 10 }]}>
              {filterData?.gender?.map(gen => (
                <TouchableOpacity
                  onPress={() => _handleGenderFilter(gen)}
                  key={gen}
                  style={styles.option}>
                  <Text
                    style={{
                      marginLeft: 16,
                      color: gen == gender ? '#111111' : '#64646D',
                      fontWeight: gen == gender ? '600' : '400',
                    }}>
                    {gen}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </FilterModal>
      {/* Size Filter */}
      <FilterModal
        isVisible={sizeModal}
        onBackButtonPress={() => {
          setSizeModal(!sizeModal);
        }}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        animationInTiming={500}
        animationOutTiming={500}
        style={{ justifyContent: "flex-end", margin: 0, }}>
        <View style={{ backgroundColor: '#fff', width: '100%', margin: 0, padding: 15, }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSizeModal(false)}>
                <Image
                  style={styles.modalClose}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Size</Text>
            </View>
            <View style={{ maxHeight: 300 }}>
              <FlatList
                data={filterData?.size}
                extraData={filterData?.size}
                numColumns={3}
                renderItem={({ item }) => (
                  <View key={item.name} style={[styles.option, { width: '33%' }]}>
                    <CheckBox
                      value={selectedSizes.includes(item.name)}
                      onValueChange={() => toggleSize(item.name)}
                      boxType="square"
                      onAnimationType="fade"
                      offAnimationType="fade"
                      onCheckColor="grey"
                      onTintColor="grey"
                      style={{ height: 25, width: 25 }}
                    />
                    <Text
                      style={{
                        marginLeft: 16,
                        color: '#64646D',
                        fontSize: 14,
                        // fontWeight: '400',
                        fontFamily: 'Poppins-Medium',
                      }}>
                      {item.name}
                    </Text>
                  </View>
                )}
              />
              {/* <ScrollView style={styles.modalOptions}>
                {filterData?.size?.map(size => (
                  <View key={size.name} style={styles.option}>
                    <CheckBox
                      value={selectedSizes.includes(size.name)}
                      onValueChange={() => toggleSize(size.name)}
                      boxType="square"
                      onAnimationType="fade"
                      offAnimationType="fade"
                      onCheckColor="grey"
                      onTintColor="grey"
                      style={{ height: 25, width: 25 }}
                    />
                    <Text
                      style={{
                        marginLeft: 16,
                        color: '#64646D',
                        fontSize: 14,
                        fontWeight: '400',
                        fontFamily: 'Poppins',
                      }}>
                      {size.name}
                    </Text>
                  </View>
                ))}
              </ScrollView> */}
            </View>
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSelectedSizes([])}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={_handleSizeFIlter}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </FilterModal>
      {/* Side Filter! */}
      <FilterModal
        isVisible={filterModal}
        onBackButtonPress={() => {
          setFilterModal(!filterModal);
        }}
        animationIn={'slideInLeft'}
        animationOut={'slideOutLeft'}
        animationInTiming={500}
        animationOutTiming={500}
        style={{ justifyContent: "flex-start", margin: 0, }}
      >
        <View style={{ backgroundColor: '#fff', height: '100%', width: '100%', margin: 0, padding: 0, }}>
          <FilterScreen
            initialFilter={filterTypeRef}
            data={filterData}
            appliedFilter={AppliedFilter}
            onOnlyClose={() => {
              setFilterModal(false);
            }}
            close={(value) => closeFilterApply(value)}
          />
        </View>
      </FilterModal>
    </SafeAreaView>
  );
};

export default SubCategory2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
  },
  filterName: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins-Medium',
    lineHeight: 18,
    color: '#111111',
  },
  itemName: {
    fontSize: 12,
    // fontWeight: Platform.OS === 'android' ? '700' : '500',
    lineHeight: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111111',
  },
  subtitle: {
    fontSize: 12,
    // fontWeight: '400',
    lineHeight: 18,
    fontFamily: 'Poppins-Regular',
    color: '#64646D',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 5,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#DEDEE0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: Platform.OS === 'android' ? '700' : '500',
    margin: 16,
    marginLeft: 8,
    color: '#000000',
  },
  modalClose: {
    marginLeft: 10,
    height: 32,
    width: 32,
  },
  modalOptions: {
    width: '100%',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  clearButton: {
    paddingVertical: 12,
    borderColor: '#DEDEE0',
    borderWidth: 1,
    borderRadius: 20,
    width: '48%',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#111111',
    fontFamily: 'Poppins-Medium'
  },
  applyButton: {
    paddingVertical: 12,
    backgroundColor: '#111111',

    borderRadius: 20,
    width: '48%',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    color: '#FFFFFF', fontFamily: 'Poppins-Medium',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#000000',
    borderRadius: 30,
    padding: 15,
    elevation: 5,
  },
  buttonIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  noDataView: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});
