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
} from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomHeader from '../../components/CustomHeader';
import { responsiveWidth } from '../../utils';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { BASE_URL } from '../../config';
import FilterScreen from './FilterScreen';
import CheckBox from '@react-native-community/checkbox';

const SubCategory = ({ navigation, route: { params } }) => {
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
  const [noData, setnoData] = useState('')

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
    resetAndFetchProducts();
  }, [gender, sortBy]);

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
    const tagsString = tagsData.join(',');
    const body = {
      page: pageNum,
      ...(params.subsubCatData && { tags: tagsString }),
      ...(params.cat_id && { cat_id: params.cat_id }),
      ...(gender !== null && { gender: gender }),
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
    if (response.status == 200) {
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
        },
      ]}>
      <Text style={styles.filterName}>{name}</Text>
      <Image
        style={{ height: 6, width: 10, margin: 6 }}
        source={require('../../assets/Home/down.png')}
      />
    </TouchableOpacity>
  );

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
                  // 180
                  showsHorizontalScrollIndicator={false}
                />
                <View>
                  <View style={[styles.row, { paddingVertical: 6, paddingBottom: 8, backgroundColor: 'white' }]}>
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
                    <FilterComp name={'Sort by'} onPress={() => setSortModal(true)} />
                    <FilterComp name={'Gender'} onPress={() => setGenderModal(true)} />
                    <FilterComp name={'Size'} onPress={() => setSizeModal(true)} />
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
          <Modal
            animationType="slide"
            transparent={true}
            visible={filterModal}
            onRequestClose={() => {
              setFilterModal(!filterModal);
            }}>
            <FilterScreen close={() => setFilterModal(false)} />
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={sortModal}
            onRequestClose={() => {
              setSortModal(!sortModal);
            }}>
            <View style={styles.modalOverlay}>
              <View
                style={[styles.modalContainer, { height: responsiveWidth(280) }]}>
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
                  {['new', 'popular', 'high_to_low', 'low_to_high'].map(
                    sort => (
                      <TouchableOpacity
                        onPress={() => {
                          setSortBy(sort);
                          setSortModal(false);
                        }}
                        key={sort}
                        style={styles.option}>
                        <Text
                          style={{
                            marginLeft: 16,
                            color: sortBy == sort ? '#111111' : '#64646D',
                            fontWeight: sortBy == sort ? '600' : '400',
                          }}>
                          {sort}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={genderModal}
            onRequestClose={() => {
              setGenderModal(!genderModal);
            }}>
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContainer,
                  { maxHeight: responsiveWidth(250) },
                ]}>
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
                      onPress={() => {
                        setGender(gen);
                        setGenderModal(false);
                      }}
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
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={sizeModal}
            onRequestClose={() => {
              setSizeModal(!sizeModal);
            }}>
            <View style={styles.modalOverlay}>
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
                <ScrollView style={styles.modalOptions}>
                  {['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XXL'].map(
                    size => (
                      <View key={size} style={styles.option}>
                        <CheckBox
                          value={selectedSizes.includes(size)}
                          onValueChange={() => toggleSize(size)}
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
                          {size}
                        </Text>
                      </View>
                    ),
                  )}
                </ScrollView>
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
          </Modal>
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
