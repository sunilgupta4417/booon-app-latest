import React from 'react';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native';
import {TouchableOpacity} from 'react-native';

const AddressContainer = ({onPress, item}) => {
  return (
    <TouchableOpacity onPress={onPress} style={{padding:10, backgroundColor:'#f1f1f1',borderRadius:4,marginBottom:5}}>
      <Text style={[styles.headerTitle,{fontSize: 17,marginBottom:5}]}>{item.add_type}</Text>
      <Text style={[styles.headerTitle, {fontSize: 14}]}>
        {item.address}
      </Text>
      <Text style={[styles.headerTitle, {fontSize: 14}]}>
        {item.zipcode}
      </Text>
    </TouchableOpacity>
  );
};

export {AddressContainer};

const styles = StyleSheet.create({
  headerTitle: {
    // fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins-Medium',
    color: '#111111',
  },
});
