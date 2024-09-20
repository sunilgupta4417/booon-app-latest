import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    View,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import React, { useState } from 'react';
import { responsiveWidth } from '../../utils';
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const SearchProduct = ({ navigation }) => {
    const [SearchText, setSearchText] = useState('')
    const [Loading, setLoading] = useState(false)
    const [imageBase, setImageBase] = useState(global.imageThumbPath);
    const [SearchListing, setSearchListing] = useState([])
    const [page, setPage] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const productIdsSet = new Set();

    React.useEffect(() => {
        if (SearchText) {
            // Call the search API when page or search text changes
            productSearchingHook(page);
        }
    }, [page]);

    const setText = (text) => {
        if (!text) {
            setSearchListing([]);
        };
        setSearchText(text);
    }

    const callTheAPI = () => {
        setIsDataLoading(true);
        productSearchingHook()
    }

    const productSearchingHook = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://swiftbird-hxyrcg0.an.gateway.dev/swiftbird/browse/search/${SearchText}`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        pageNo: page, // Pass the page number dynamically
                        pageSize: 30,
                    }),
                }
            );

            const result = await response.json();
            console.log('=====result?.fashionProducts====', JSON.stringify(result));
            const parentArray = result?.fashionProducts || []; // Collection of fashionProducts array
            const childArray = []; // Temp array, Collection of all the variants


            parentArray.forEach((parentItem) => {
                parentItem?.variants?.forEach((childItem) => {
                    const productId = childItem?.tenantMetadata?.product_id;
                    // Check if product_id is not in the set
                    if (!productIdsSet.has(productId)) {
                        childItem.brandName = parentItem?.brandName; // Adding the brand name to the child object
                        childArray.push(childItem);
                        productIdsSet.add(productId); // Add the product_id to the set to avoid duplicates
                    }
                    // const productId = childItem?.tenantMetadata?.product_id;
                    // childItem.brandName = parentItem?.brandName; // Adding the brand name in child object
                    // childArray.push(childItem);
                });
            });

            // Update the SearchListing state
            setSearchListing((prevData) =>
                page === 1 ? childArray : [...prevData, ...childArray]
            );
            setIsDataLoading(false);

            // Check if more data exists or not
            setHasMoreData(childArray.length > 0);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsDataLoading(false);
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!Loading && hasMoreData) {
            setPage((prevPage) => prevPage + 1); // Increment the page number
        }
    };

    const _renderList = ({ item, index }) => {
        return (
            <TouchableOpacity
                // key={index.toString()}
                onPress={() => navigation.navigate('ProductScreen', { item: item, searchItem: true })}
                style={{ marginVertical: 5, marginLeft: 10 }}>
                <Image
                    style={{ width: responsiveWidth(190), height: responsiveWidth(240) }}
                    source={{ uri: `${imageBase}/${item.imageUrls[0]}` }}
                />
                <View style={{ width: responsiveWidth(190), padding: 5 }}>
                    <Text style={styles.itemName}>{item.brandName}</Text>
                    <Text style={styles.subtitle} numberOfLines={2}>{item.productName}</Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            // justifyContent: 'space-between',
                            width: '84%',
                        }}>
                        <Text style={styles.itemName}>
                            ₹{parseInt(item?.sellPrice) + '  '}
                        </Text>
                        <Text style={[styles.subtitle, { textDecorationLine: 'line-through' }]}>
                            ₹{parseInt(item.costPrice) + ' '}
                        </Text>
                        <Text style={styles.subtitle}> {item?.discountPercent}% Off</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View >
                <View style={{ flexDirection: 'row', borderBottomColor: '#999', borderBottomWidth: 1, padding: 5 }}>
                    <TouchableOpacity onPress={() => { navigation.goBack() }}>
                        <Image style={styles.icon} source={require('../../assets/back.png')} />
                    </TouchableOpacity>
                    <View style={styles.txtIpBox}>
                        <TextInput
                            onSubmitEditing={callTheAPI}
                            onChangeText={(text) => setText(text)}
                            value={SearchText}
                            placeholder="Search for products, brand and more..."
                            style={styles.txtIp}
                        />
                        <View style={{ height: 40, borderWidth: 0, width: 85, }}>
                            {isDataLoading ?
                                <ActivityIndicator
                                    size={"large"}
                                    color={"black"}
                                />
                                :
                                null}
                        </View>
                    </View>
                </View>
            </View>
            {SearchListing.length > 0 &&
                <>
                    <FlatList
                        data={SearchListing}
                        numColumns={2}
                        renderItem={_renderList}
                        keyExtractor={(item, index) => index.toString()}
                        onEndReachedThreshold={0.9} // Fetch more data when 90% from the end
                        onEndReached={handleLoadMore} // Call load more handler
                        ListFooterComponent={Loading && <ActivityIndicator size="large" />} // Show a loading indicator
                    />
                </>
            }
        </SafeAreaView>
    );
};

export default SearchProduct;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    txtIpBox: {
        flexDirection: 'row',
        padding: 4,
        height: 40,
        width: '94%',
        alignSelf: 'center',
        borderRadius: 20, // Add margin below the search box
        paddingLeft: 20
    },
    SearchIcon: {
        width: 24,
        height: 24,
        margin: 4,
        marginHorizontal: 5,
    },
    txtIp: {
        padding: 5,
        flex: 1,
        fontFamily: 'Poppins-Medium'
    },
    icon: {
        width: 32,
        height: 32,
    },
    subtitle: {
        fontSize: 12,
        // fontWeight: '400',
        lineHeight: 18,
        fontFamily: 'Poppins-Regular',
        color: '#64646D',
    },
    itemName: {
        fontSize: 12,
        // fontWeight: Platform.OS === 'android' ? '700' : '500',
        lineHeight: 16,
        fontFamily: 'Poppins-Medium',
        color: '#111111',
    },

});
