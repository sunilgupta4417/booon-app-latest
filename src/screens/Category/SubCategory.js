import React, { useEffect, useState, useRef } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import { responsiveWidth } from '../../utils';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { BASE_URL } from '../../config';
import FilterScreen from './FilterScreen';
import FilterModal from 'react-native-modal';
import { useDispatch } from 'react-redux';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
const width = Dimensions.get('window').width;

const SubCategory = ({ navigation, route: { params } }) => {
  const dispatch = useDispatch();
  const filterSort = useRef({});
  const [filterTypeRef, setfilterTypeRef] = useState('discount');
  const [subSubCatData, setSubSubCatData] = useState([]);
  const [imageBase, setImageBase] = useState('');
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [tagsData, setTagsData] = useState([]);
  const [filterModal, setFilterModal] = useState(false);
  const [sortModal, setSortModal] = useState(false);
  const [sizeModal, setSizeModal] = useState(false);
  const [genderModal, setGenderModal] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [gender, setGender] = useState(null);
  const [filterData, setFilterData] = useState(null);
  const [noData, setnoData] = useState('');
  const [AppliedFilter, setAppliedFilter] = useState({});
  const [subcategory, setSubCategory] = useState([]);
  const subCategoryId = useRef(params.subsubcat_id);
  const [filterObjToData, setfilterObjToData] = useState(null);
  const sortFiterlist = [
    { lable: 'Newest First', value: 'new' },
    { lable: 'Popularity', value: 'popular' },
    { lable: 'Price - High to Low', value: 'high_to_low' },
    { lable: 'Price - Low to High', value: 'low_to_high' }
  ];


  useEffect(() => {
    setSubSubCatData(params.subsubCatData);
    if (params.subsubCatData) {
      params.subsubCatData.map(e => {
        tagsData.push(e.name);
      });
    }
    if (params.tag) { tagsData.push(params.tag) }
    getProductList(1);
  }, []);

  useEffect(() => {
    const getAllLists = async () => {
      await getFilter();
    }
    getAllLists();
  }, []);

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
    // if (isLoading || !hasMoreData) return;
    setIsLoading(true);
    console.log("Call Product List => " + filterSort.current.gender);
    const tagsString = tagsData.join(',');
    const body = {
      page: pageNum,
      ...(params.subsubCatData && { tags: tagsString }),
      ...(params.cat_id && { cat_id: params.cat_id }),
      ...(gender !== null || filterSort.current.gender !== null && { gender: filterSort.current.gender !== null ? filterSort.current.gender : gender }),
      ...(sortBy !== null && { short: sortBy }),
      seller_id: global.sellerId
    };
    if (no_of_item) {
      body.no_of_item = no_of_item;
    }
    const response = await axios.post(
      `${BASE_URL}/product-list`,
      body,
    );
    console.log("Body of Product == > " + JSON.stringify(body));
    if (response.status == 200) {
      console.log("Response of Product List !! ")
      setIsLoading(false);
      setImageBase(global.imageThumbPath)
      if (pageNum === 1) {
        setSubCategoryData(response.data.product.data);
        setHasMoreData(true);
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
        setHasMoreData(false);
        setnoData('No Data')
      }
    }
    setIsLoading(false);
  };
  // console.log(tagsData,"tagsData")


  const resetAndFetchProducts = () => {
    setPage(1);
    setSubCategoryData([]);
    setHasMoreData(true);
    getProductList(1);
  };

  const renderSubSubCategory = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('SubCategory2', {
            title: item.name,
            tag: item.name,
            height: true
          })
        }
        style={{
          borderRadius: 10,
          overflow: 'hidden',
          borderWidth: 0,
          margin: 6,
        }}>
        <ImageBackground
          source={{ uri: item.image }}
          style={{
            width: responsiveWidth(145),
            height: responsiveWidth(118),
            justifyContent: 'flex-end',
          }}>
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.1)']}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '100%',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                fontFamily: 'Poppins',
                color: '#FFFFFF',
                width: responsiveWidth(90),
                alignSelf: 'center',
                textAlign: 'center',
                marginBottom: 16,
              }}>
              {item.name}
            </Text>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderSubCategory = ({ item }) => {
    return (
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
  };

  const renderHeaderCat = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        subCategoryId.current = item?.cat_id;
        let category = { subsubcat_id: [item?.cat_id] }
        closeFilterApply({ ...AppliedFilter, ...category })
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
          margin: 5, // Adjusted margin for spacing
        }}
        source={{ uri: item.image }}
      />
      <Text
        numberOfLines={1}
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

    if (filterSort.current.gender) {
      url = url + `&gender=${filterSort.current.gender}`;
    }

    console.log('-=-=-url-=-=url-=-=-', url);

    const res = await axios.get(url);
    console.log("Here is the Res Data => " + JSON.stringify(res));
    if (res?.data) {
      setFilterData(res?.data);
    }
    let filterObjToData = Object.keys(res?.data);
    setfilterObjToData(filterObjToData)
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

    let genders = { gender: genderVAl }
    setGenderModal(false)
    closeFilterApply({ ...AppliedFilter, ...genders })
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
      console.log("Set the value of filterSort!");
      filterSort.current = filterValue;
      getProductList(1);
      setFilterModal(false);
      await getFilter();
    } else {
      console.log("I'm in the Else!");
      filterSort.current = {};
      getProductList(1);
      setFilterModal(false);
      await getFilter();
    }
  }


  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={params.title} back search wishlist bag />
      {subCategoryData.length > 0 ? (
        <>
          <FlatList
            data={subCategoryData}
            renderItem={renderSubCategory}
            numColumns={2}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListHeaderComponent={() => (
              <>
                <FlatList
                  data={subSubCatData}
                  renderItem={renderSubSubCategory}
                  horizontal
                  style={{ height: responsiveWidth(140) }}
                  showsHorizontalScrollIndicator={false}
                />
                <View style={{
                  width: width,
                  backgroundColor: 'white',
                }}>
                  <View style={[
                    {
                      flexDirection: "row",
                      paddingBottom: 15,

                      paddingTop: 6,
                      backgroundColor: 'white',
                      paddingLeft: 14,
                    },
                  ]}>
                    <TouchableOpacity
                      onPress={() => setFilterModal(true)}
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
                    <FilterComp
                      name={'Sort by'}
                      onPress={() => setSortModal(true)}
                    />
                    <FilterComp
                      name={'Gender'}
                      onPress={() => {
                        setGenderModal(true);
                      }}
                    />
                    <FilterComp
                      name={'Size'}
                      onPress={() => {
                        setSizeModal(true);
                      }}
                    />
                    {/* <FilterComp name={'Sort by'} onPress={() => setSortModal(true)} /> */}
                    {/* <FilterComp name={'Gender'} onPress={() => setGenderModal(true)} /> */}
                    {/* <FilterComp name={'Size'} onPress={() => setSizeModal(true)} /> */}
                  </View>
                </View>
              </>
            )}
            ListFooterComponent={
              isLoading && (
                <ActivityIndicator size="small" color="#000" />
              )
            }
          />

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

        </>
      ) : (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text>{noData}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SubCategory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
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
