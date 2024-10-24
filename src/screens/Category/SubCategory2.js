import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import CustomHeader from '../../components/CustomHeader';
import { responsiveWidth } from '../../utils';
import FilterScreen from './FilterScreen';
import FilterModal from 'react-native-modal'
import axios from 'axios';
import { BASE_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAddressList } from '../../hooks/hook';
import { useQuery } from '@tanstack/react-query';
const width = Dimensions.get('window').width;


const SubCategory2 = ({ navigation, route: { params } }) => {

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
  const sortFiterlist = [
    {lable:'Newest First',value:'new'},
    {lable:'Popularity',value:'popular'},
    {lable:'Price - High to Low',value:'high_to_low'},
    {lable:'Price - Low to High',value:'low_to_high'}
  ]

  useEffect(() => {
    const getAllLists = async () => {
      setIsLoading(true)
      await getSubCategory();
      await getProductList(1);
      await getFilter();
      setIsLoading(false)
      // resetAndFetchProducts();
    }
    getAllLists();
  }, []);

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
    const res = await axios.get(url);
    if (res?.data) {
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

  const getProductList = async (pageNum, no_of_item = 10) => {
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

  // const resetAndFetchProducts = () => {
  //   // setPage(1);
  //   // setSubCategoryData([]);
  //   // setHasMoreData(true);
  //   // getProductList(1);
  // };

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

  const renderHeaderCat = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        subCategoryId.current = item?.cat_id;
        getProductList(1, 10);
      }}
      style={{
        alignItems: 'center',
        // justifyContent: "center", // Center items vertically
        width: 80,
        borderWidth: 0,
        paddingBottom: 10,
      }}>
      <Image
        style={{
          height: 64,
          width: 64,
          borderRadius: 37,
          margin: 5, // Adjusted margin for spacing
        }}
        source={{ uri: item.image }}
      />
      <Text
        style={{
          fontSize: 12, // Smaller text to fit in reduced height
          fontWeight: '400',
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

  const _handleGenderFilter = (gender) => {
    // let genders = {gender:gender}
    // Alert.alert('-=-=-=-=-', {...filterSort.current, gender});
    
    // closeFilterApply()
  }

  const closeFilterApply = (value) => {
    if (Object.keys(value).length > 0) {
      let filterValue = {};
      if (Object.keys(value.brandFilters).length > 0) {
        let keys = Object.keys(value.brandFilters).join(',');
        filterValue.brandname = keys;
      }

      if (Object.keys(value.colorFilters).length > 0) {
        let keys = Object.keys(value.colorFilters).join(',');
        filterValue.color = keys;
      }

      if (value.gender) {
        filterValue.gender = value.gender;
      }

      if (Object.keys(value.sizeFilters).length > 0) {
        let keys = Object.keys(value.sizeFilters).join(',');
        filterValue.size = keys;
      }

      if (Object.keys(value.sortBy).length > 0) {
      }

      if (value?.discountFilter !== '') {
        filterValue.discount_value = value?.discountFilter;
      }

      if (value?.price !== '') {
        filterValue.price = value?.price;
      }
      filterSort.current = filterValue;
      getProductList(1);
      setFilterModal(false);
    } else {
      filterSort.current = {};
      getProductList(1);
      setFilterModal(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={params.title} back search wishlist bag />
      {subCategoryData?.length > 0 ? <FlatList
        data={subCategoryData}
        renderItem={renderSubCategory}
        numColumns={2}
        style={{ borderWidth: 0 }}
        keyExtractor={(item, index) => index + ''}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={10}
        ListHeaderComponent={() => (
          <>
            <View style={params.bannerData || params.brandname || params.height ? {} : { height: 100 }}>
              <FlatList
                data={subcategory}
                renderItem={renderHeaderCat}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
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
            <ActivityIndicator size="large" color="#0000ff" />
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
      :
      <View style={{justifyContent:'center',alignItems:'center'}}>
        <Text>No Vendor available for you location</Text>
      </View>
      }
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
        <View style={{ backgroundColor: '#fff', width: '100%', margin: 0,padding: 15,}}>
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
                  onPress={() => {
                    setSortBy(sort.value);
                  }}
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
        <View style={{ backgroundColor: '#fff', width: '100%', margin: 0,padding: 15,}}>
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
                  onPress={()=>_handleGenderFilter(gen)}
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
        <View style={{ backgroundColor: '#fff', width: '100%', margin: 0,padding: 15,}}>
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
            <View style={{maxHeight:300}}>
            <ScrollView style={styles.modalOptions}>
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
            </ScrollView>
            </View>
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSelectedSizes([])}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setSizeModal(false)}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </FilterModal>
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
            appliedFilter={filterSort.current}
            // cat_id={params?.cat_id}
            // subcat_id={params?.subcat_id}
            // subCategoryId={subCategoryId?.current}
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
    // justifyContent: 'space-evenly',
  },
  filterName: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 18,
    color: '#111111',
  },
  itemName: {
    fontSize: 12,
    fontWeight: Platform.OS === 'android' ? '700' : '500',
    lineHeight: 16,
    fontFamily: 'Poppins',
    color: '#111111',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    fontFamily: 'Poppins',
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
    color: '#FFFFFF',
  },
});
