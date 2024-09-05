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
} from 'react-native';
import React, { useState } from 'react';
import { responsiveWidth } from '../../utils';

const SearchProduct = ({ navigation }) => {
    const [SearchText, setSearchText] = useState('')
    const [Loading, setLoading] = useState(false)
    const [imageBase, setImageBase] = useState(global.imageThumbPath);
    const [SearchListing, setSearchListing] = useState([])

    const productSearchingHook = async () => {
        setLoading(true)
        try {
            const response = await fetch(`https://swiftbird-hxyrcg0.an.gateway.dev/swiftbird/browse/search/${SearchText}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pageNo: 1,
                    pageSize: 10
                })
            });

            const result = await response.json();
            console.log('==================result?.fashionProducts=========', JSON.stringify(result?.fashionProducts));

            setSearchListing(result?.fashionProducts)
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const _renderList = ({ item, index }) => {
        return (
            <TouchableOpacity
            key={index}
                onPress={() => navigation.navigate('ProductScreen', { item: item })}
                style={{ marginVertical: 5, marginLeft: 10 }}>
                <Image
                    style={{ width: responsiveWidth(190), height: responsiveWidth(240) }}
                    source={{ uri: `${imageBase}/${item.variants[0].imageUrls[0]}` }}
                />
                <View style={{ width: responsiveWidth(190), padding: 5 }}>
                    <Text style={styles.itemName}>{item.brandName}</Text>
                    <Text style={styles.subtitle} numberOfLines={2}>{item.variants[0].productName}</Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            // justifyContent: 'space-between',
                            width: '84%',
                        }}>
                        <Text style={styles.itemName}>
                            ₹{item.variants[0].sellPrice}
                        </Text>
                        <Text style={[styles.subtitle, { textDecorationLine: 'line-through' }]}>
                            ₹{item.variants[0].costPrice}
                        </Text>
                        <Text style={styles.subtitle}> {item.variants[0].discountPercent}% Off</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View >
                <View style={{ flexDirection: 'row', borderBottomColor: '#999', borderBottomWidth: 1, padding: 5 }}>
                    <Image style={styles.icon} source={require('../../assets/back.png')} />
                    <View style={styles.txtIpBox}>
                        <TextInput
                            onSubmitEditing={productSearchingHook}
                            onChangeText={(text) => setSearchText(text)}
                            value={SearchText}
                            placeholder="Search for products, brand and more..."
                            style={styles.txtIp}
                        />
                    </View>
                </View>
            </View>
            {SearchListing.length > 0 && 
            <FlatList
                data={SearchListing}
                // extraData={SearchListing}
                numColumns={2}
                style={{ borderWidth: 0 }}
                renderItem={_renderList}
            />}
        </SafeAreaView>
    );
};

export default SearchProduct;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        // paddingHorizontal: 4,
    },
    txtIpBox: {
        flexDirection: 'row',
        // borderWidth: 1,
        padding: 4,
        height: 40,
        width: '94%',
        alignSelf: 'center',
        // borderColor: 'grey',
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
});
