import React from 'react';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native';
import {TouchableOpacity} from 'react-native';

const AddressContainer = ({onPress, item}) => {
  return (
    <TouchableOpacity onPress={onPress} style={{margin: 10}}>
      <Text style={styles.headerTitle}>{item.add_type}</Text>
      <Text style={[styles.headerTitle, {fontWeight: '400', fontSize: 12}]}>
        {item.address}
      </Text>
    </TouchableOpacity>
  );
};

export {AddressContainer};

const styles = StyleSheet.create({
  headerTitle: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111111',
  },
});
