import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    Platform,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    TextInput,
    Button,
    Alert,
} from 'react-native';
import { responsiveHeight, responsiveWidth } from '../../utils';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config';
import axios from 'axios';
import CustomHeader from '../../components/CustomHeader';
import CheckBox from '@react-native-community/checkbox';

export default PastOrder = () => {
    const [orderData, setOrderData] = useState([]);
    const [userDetail, setUserDetail] = useState({});
    const [token, setToken] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [bankAccountName, setBankAccountName] = useState('');
    const [bankAccountNumber, setBankAccountNumber] = useState('');
    const [bankName, setBankName] = useState('');
    const [bankIFSC, setBankIFSC] = useState('');
    const [errors, setErrors] = useState({});
    const [selectedItem, setSelectedItem] = useState();
    const [returnDescription, setReturnDescription] = useState('');
    const [modalData, setModalData] = useState();
    const [qtyModal, setQtyModal] = useState(false);
    const [selectedQty, setSelectedQty] = useState([]);

    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                const savedToken = await AsyncStorage.getItem('token');
                const headers = {
                    Authorization: `Bearer ${savedToken}`,
                };
                const response = await axios.get(`${BASE_URL}/profile`, { headers });
                setToken(savedToken);
                setUserDetail(response?.data)
            };
            fetchUserData();
            getOrders();
        }, []),
    );


    const getOrders = async () => {
        const savedToken = await AsyncStorage.getItem('token');
        const data = JSON.parse(await AsyncStorage.getItem('userData'));
        const headers = {
            Authorization: `Bearer ${savedToken}`,
        };
        console.log("BODY of Past Order => " + JSON.stringify(
            {
                user_id: data?.id,
                device_id: global.deviceId,
                order_type: 'delivered_order'
            }
        ))
        const response = await axios.post(
            `${BASE_URL}/order-list`,
            {
                user_id: data?.id,
                device_id: global.deviceId,
                order_type: 'delivered_order'
            },
            {
                headers,
            },
        );
        if (response.status == 200) {
            console.log('-=-=', response?.data);
            setOrderData(response.data);
        }
    };

    // Validation Function
    const validateForm = () => {
        let valid = true;
        let newErrors = {};

        // Bank Account Name Validation (should not contain numbers)
        if (!/^[A-Za-z\s]+$/.test(bankAccountName)) {
            newErrors.bankAccountName = 'Account name should only contain letters.';
            valid = false;
        }

        // Bank Account Number Validation (should only contain digits)
        if (!/^\d+$/.test(bankAccountNumber)) {
            newErrors.bankAccountNumber = 'Account number should only contain digits.';
            valid = false;
        }

        // Bank Name Validation (should not contain numbers or special characters)
        if (!/^[A-Za-z\s]+$/.test(bankName)) {
            newErrors.bankName = 'Bank name should only contain letters.';
            valid = false;
        }

        // IFSC Code Validation (should be 4 letters followed by 7 digits)
        if (!/^[A-Za-z]{4}\d{7}$/.test(bankIFSC)) {
            newErrors.bankIFSC = 'Invalid IFSC code format.';
            valid = false;
        }

        // Return Description Validation (should not be empty)
        if (returnDescription.trim().length === 0) {
            newErrors.returnDescription = 'Return description cannot be empty.';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    // Submit Function
    const handleSubmit = async () => {
        if (validateForm()) {
            // Call the Return API here
            const savedToken = await AsyncStorage.getItem('token');
            const data = JSON.parse(await AsyncStorage.getItem('userData'));
            const headers = {
                Authorization: `Bearer ${savedToken}`,
            };
            console.log("Body of Return Order => " + JSON.stringify({
                user_id: data?.id,
                device_id: global.deviceId,
                seller_id: selectedItem.seller_id,
                order_id: selectedItem.order_id,
                order_item: [{ id: selectedItem.id, qty: selectedQty[0] }],
                return_reason: returnDescription,
                return_acc_detail: { ifscCode: bankIFSC, accountName: bankAccountName, accountNumber: bankAccountNumber, branchName: bankName }
            }));
            const response = await axios.post(
                `${BASE_URL}/return-order`,
                {
                    user_id: data?.id,
                    device_id: global.deviceId,
                    seller_id: selectedItem.seller_id,
                    order_id: selectedItem.order_id,
                    order_item: [{ id: selectedItem.id, qty: selectedQty[0] }],
                    return_reason: returnDescription,
                    return_acc_detail: { ifscCode: bankIFSC, accountName: bankAccountName, accountNumber: bankAccountNumber, branchName: bankName }
                },
                {
                    headers,
                },
            );
            console.log("Response =>> " + response);
            if (response.status == 200) {
                console.log("Response =>> " + response.data);
                Alert.alert('Request Submitted', 'Return order generated successfully!');
                await getOrders();
            }
            // const formdata = new FormData();
            // const tempObj = {
            //     user_id: data?.id,
            //     device_id: global.deviceId,
            //     seller_id: selectedItem.seller_id,
            //     order_id: selectedItem.order_id,
            //     order_item: [{ id: selectedItem.id, qty: selectedQty[0] }],
            //     return_reason: returnDescription,
            //     return_acc_detail: { ifscCode: bankIFSC, accountName: bankAccountName, accountNumber: bankAccountNumber, branchName: bankName }
            // }

            // await axios.post(
            //     `${BASE_URL}/return-order`,
            //     {
            //         tempObj,
            //     },
            //     {
            //         headers,
            //     },
            //     {
            //         maxBodyLength: Infinity,
            //     }
            // ).then((response) => {
            //     console.log("Response =>> " + JSON.stringify(response.data));
            //     Alert.alert('Request Submitted', 'Return order generated successfully!');
            // }).catch(err => {
            //     console.log("Error is Return Order, ", JSON.stringify(err));
            // });

            setModalVisible(false);
        } else {
            Alert.alert('Form Validation Error', 'Please correct the errors in the form.');
        }
    };

    // Enable the return Modal! 
    const enableModal = (values) => {
        setModalData(values);
        setSelectedItem(values);
        setModalVisible(true);
        setSelectedQty([values?.quantity]);
    }

    const renderLiveOrderItem = ({ item }) => {
        console.log("Item is -> " + JSON.stringify(item));
        return (
            <>
                <View
                    style={[
                        styles.profileView,
                        styles.row,
                        { marginVertical: 0, borderBottomWidth: 1, borderBottomColor: '#DEDEE0' },
                    ]}>
                    <Image
                        style={{ width: responsiveWidth(89), height: responsiveWidth(118) }}
                        source={{ uri: item?.product_image }}
                    />
                    <View style={{ paddingLeft: 10, flexGrow: 1, borderWidth: 0 }}>
                        <Text style={styles.nameTxt} numberOfLines={1}>
                            {item?.product_name && item.product_name.length > 20 ? item.product_name.substring(0, 20) + "..." : item?.product_name}
                        </Text>
                        <Text style={[styles.mobileTxt, { fontWeight: '400' }]}>
                            {item?.subtitle}
                        </Text>
                        <View style={[styles.row, { marginBottom: 10 }]}>
                            <Text style={[styles.nameTxt, { fontWeight: '400' }]}>
                                Size : <Text style={{ fontWeight: '500' }}>M</Text>
                            </Text>
                            <Text style={[styles.nameTxt, { fontWeight: '400' }]}>
                                Qty : <Text style={{ fontWeight: '500' }}>{" "}{item?.quantity}</Text>
                            </Text>
                            {/* <TouchableOpacity
                                onPress={() => {
                                    setModalData(item);
                                    setQtyModal(true);
                                    setSelectedQty([item?.quantity]);
                                }}
                                disabled={true}
                                style={[
                                    styles.row,
                                    {
                                        borderWidth: 1,
                                        borderColor: '#DEDEE0',
                                        borderRadius: 20,
                                        padding: 6,
                                    },
                                ]}>
                                <Text style={[styles.nameTxt, { fontWeight: '400' }]}>
                                    Qty : <Text style={{ fontWeight: '500' }}>{" "}{selectedQty.length > 0 ? selectedQty[0] : item?.quantity}</Text>
                                </Text>
                                <Image
                                    style={{ height: 6, width: 10, margin: 4 }}
                                    source={require('../../assets/Home/down.png')}
                                />
                            </TouchableOpacity> */}
                        </View>
                        <Text style={[styles.nameTxt]}>
                            ₹{item?.product_price}{' '}
                            <Text
                                style={{
                                    fontWeight: '400',
                                    color: '#64646D99',
                                    textDecorationLine: 'line-through',
                                }}>
                                {' '}
                                ₹{item?.product_subtotal}{' '}
                            </Text>{' '}
                            <Text style={{ color: '#5EB160' }}> 40% OFF</Text>
                        </Text>
                        {item?.is_return && item?.order_status === 4 ?
                            <TouchableOpacity style={{ alignSelf: 'flex-start', marginTop: 5, paddingHorizontal: 20, backgroundColor: 'transparent', borderColor: "black", borderWidth: 1, borderRadius: 30, alignItems: 'center', paddingVertical: 5 }}
                                onPress={() => enableModal(item)}>
                                <Text style={{ color: '#000' }}>Return Order</Text>
                            </TouchableOpacity>
                            : null}
                    </View>
                </View>
            </>
        )
    };

    return (
        <SafeAreaView>
            {orderData.length > 0 ?
                <FlatList
                    data={orderData}
                    renderItem={renderLiveOrderItem}
                    contentContainerStyle={{ paddingVertical: 20 }}
                />
                :
                <View style={{ height: 600, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: "gray", fontFamily: "Poppins-SemiBold" }}>No past order found!</Text>
                </View>
            }

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: "90%", padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
                        {/* X Close Button */}
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={{ backgroundColor: 'white', position: 'absolute', top: 15, right: 20, borderWidth: 1, width: 35, height: 35, borderRadius: 20, justifyContent: "center", alignItems: "center", zIndex: 2, elevation: 2, }}
                        >
                            <Text style={{ fontSize: 20, fontFamily: "Poppins-Bold" }}>x</Text>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 20, marginBottom: 10, textAlign: 'center' }}>Bank Form</Text>

                        {/* Quantity Dropdown */}
                        <Text style={{ marginBottom: 5 }}>Select you Qty:</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setQtyModal(true);
                            }}
                            disabled={false}
                            style={{
                                flexDirection: "row",
                                borderWidth: 1,
                                borderColor: '#DEDEE0',
                                borderRadius: 20,
                                padding: 6,
                                width: 100,
                            }}>
                            <Text style={[styles.nameTxt, { fontWeight: '400' }]}>
                                Qty : <Text style={{ fontWeight: '500' }}>{" "}{selectedQty[0]}</Text>
                            </Text>
                            <Image
                                style={{ height: 6, width: 10, margin: 4, paddingLeft: "auto" }}
                                source={require('../../assets/Home/down.png')}
                            />
                        </TouchableOpacity>

                        {/* Bank Account Name */}
                        <Text style={{ marginBottom: 5 }}>Bank Account Name:</Text>
                        <TextInput
                            value={bankAccountName}
                            onChangeText={setBankAccountName}
                            placeholder="Enter Account Name"
                            style={{ borderWidth: 1, borderColor: errors.bankAccountName ? 'red' : '#ccc', borderRadius: 5, padding: 8, marginBottom: 5 }}
                        />
                        {errors.bankAccountName && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.bankAccountName}</Text>}

                        {/* Bank Account Number */}
                        <Text style={{ marginBottom: 5 }}>Bank Account Number:</Text>
                        <TextInput
                            value={bankAccountNumber}
                            onChangeText={setBankAccountNumber}
                            placeholder="Enter Account Number"
                            keyboardType="numeric"
                            maxLength={16}
                            style={{ borderWidth: 1, borderColor: errors.bankAccountNumber ? 'red' : '#ccc', borderRadius: 5, padding: 8, marginBottom: 5 }}
                        />
                        {errors.bankAccountNumber && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.bankAccountNumber}</Text>}

                        {/* Bank Name */}
                        <Text style={{ marginBottom: 5 }}>Bank Name:</Text>
                        <TextInput
                            value={bankName}
                            onChangeText={setBankName}
                            placeholder="Enter Bank Name"
                            style={{ borderWidth: 1, borderColor: errors.bankName ? 'red' : '#ccc', borderRadius: 5, padding: 8, marginBottom: 5 }}
                        />
                        {errors.bankName && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.bankName}</Text>}

                        {/* Bank IFSC Code */}
                        <Text style={{ marginBottom: 5 }}>Bank IFSC Code:</Text>
                        <TextInput
                            value={bankIFSC}
                            onChangeText={setBankIFSC}
                            placeholder="Enter IFSC Code"
                            style={{ borderWidth: 1, borderColor: errors.bankIFSC ? 'red' : '#ccc', borderRadius: 5, padding: 8, marginBottom: 5 }}
                        />
                        {errors.bankIFSC && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.bankIFSC}</Text>}

                        {/* Return Description */}
                        <Text style={{ marginBottom: 5 }}>Return Description:</Text>
                        <TextInput
                            value={returnDescription}
                            onChangeText={setReturnDescription}
                            placeholder="Enter Return Description"
                            multiline={true}
                            numberOfLines={4}
                            style={{ borderWidth: 1, borderColor: errors.returnDescription ? 'red' : '#ccc', borderRadius: 5, padding: 8, marginBottom: 5, height: 80 }}
                        />
                        {errors.returnDescription && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.returnDescription}</Text>}

                        {/* Close and Submit Buttons */}
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                            <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: '#000', justifyContent: "center", alignItems: "center", borderRadius: 20, height: 40, width: 100 }}>
                                <Text style={{ color: 'white', textAlign: 'center', fontFamily: "Poppins-SemiBold" }}>Submit</Text>
                            </TouchableOpacity>
                            {/* <TouchableOpacity onPress={() => setModalVisible(false)} style={{ backgroundColor: '#FF6347', justifyContent: "center", alignItems: "center", borderRadius: 20, height: 40, width: 100 }}>
                                <Text style={{ color: 'white', textAlign: 'center', fontFamily: "Poppins-SemiBold" }}>Close</Text>
                            </TouchableOpacity> */}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Quantity Modal! */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={qtyModal}
                onRequestClose={() => {
                    setQtyModal(!qtyModal);
                }}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setQtyModal(false)}>
                                <Image
                                    style={styles.modalClose}
                                    source={require('../../assets/cross.png')}
                                />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Qty</Text>
                        </View>
                        <ScrollView style={styles.modalOptions}>
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].slice(0, selectedItem?.quantity).map(size => (
                                <View key={size} style={styles.option}>
                                    <CheckBox
                                        value={selectedQty.includes(size)}
                                        onValueChange={() => setSelectedQty([size])}
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
                            ))}
                        </ScrollView>
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => {
                                    setSelectedSizes([]);
                                    setQtyModal(false);
                                }}>
                                <Text style={styles.clearButtonText}>{'Cancel'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={() => {
                                    setQtyModal(false);
                                }}>
                                <Text style={styles.applyButtonText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    profileView: {
        borderRadius: 10,
        width: '90%',
        marginVertical: 5,
        backgroundColor: 'white',
        padding: 16,
        alignSelf: 'center'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nameTxt: {
        fontSize: 14,
        fontWeight: Platform.OS == 'android' ? '700' : '500',
        fontFamily: 'Poppins',
        lineHeight: 16,
        color: '#111111',
        marginRight: 20,
    },
    mobileTxt: {
        fontSize: 12,
        fontWeight: Platform.OS == 'android' ? '700' : '500',
        fontFamily: 'Poppins',
        lineHeight: 16,
        color: '#64646D',
    },
    circle: {
        height: 6,
        width: 6,
        borderRadius: 3,
        backgroundColor: '#D9D9D9',
        margin: 5,
    },
    editView: {
        // borderBottomWidth:1,
        width: responsiveWidth(26),
        height: responsiveWidth(15),
        marginVertical: 6,
    },
    editTxt: {
        fontSize: 12,
        fontWeight: Platform.OS == 'android' ? '700' : '500',
        fontFamily: 'Poppins',
        lineHeight: 16,
        color: '#111111',
        textDecorationLine: 'underline',
    },
    liveOrderTxt: {
        fontSize: 14,
        fontWeight: Platform.OS == 'android' ? '700' : '500',
        fontFamily: 'Poppins',
        lineHeight: 22,
        color: '#111111',
        marginLeft: 20,
        marginBottom: 10,
    },
    logOutView: {
        // borderBottomWidth:1,
        // width:responsiveWidth(60),
        // height:responsiveWidth(15),
        // marginVertical: 6,
        margin: responsiveWidth(16),
        paddingHorizontal: 8,
    },
    font12: {
        fontSize: 12,
        fontFamily: 'Poppins',
        fontWeight: Platform.OS == 'android' ? '700' : '500',
        color: '#000000',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        // maxHeight: responsiveWidth(400),
        minHeight: responsiveWidth(200),
        // paddingBottom: 5,
        // alignItems: 'center',
    },
    modalClose: {
        marginLeft: 10,
        height: 32,
        width: 32,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: Platform.OS === 'android' ? '700' : '500',
        margin: 16,
        marginLeft: 8,
        color: '#000000',
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
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#DEDEE0',
    },
    couponTextbox: {
        // height:40,
        // paddingVertical: 15,
        borderWidth: 1,
        borderColor: '#DEDEE0',
        borderRadius: 20,
        width: '65%',
        padding: 8,
        textAlign: 'center',
        fontSize: 12,
        fontFamily: 'Poppins',
        fontWeight: Platform.OS == 'android' ? '700' : '500',
        color: '#000000',
    },
});