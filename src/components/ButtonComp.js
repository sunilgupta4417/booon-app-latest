import {
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import React from 'react';

const ButtonComp = ({
  title,
  loading = false,
  onPress,
  color,
  txtColor,
  bdrColor,
  width,
  padding,
  img,
  imgStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.Btn,
        {
          backgroundColor: color,
          borderColor: bdrColor,
          borderWidth: 1,
          width: width ? width : '80%',
          padding: padding ? padding : 8,
          flexDirection: img ? 'row' : 'column',
        },
      ]}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator color={'white'} style={{margin: 9}} />
      ) : (
        <>
          {img && <Image style={imgStyle} source={img} />}
          <Text style={[styles.BtnTxt, {color: txtColor}]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default ButtonComp;

const styles = StyleSheet.create({
  Btn: {
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
    margin: 10,
    justifyContent: 'center',
  },
  BtnTxt: {
    fontSize: 14,
    // fontWeight: Platform.OS == 'android' ? '700' : '500',
    margin: 2,
    marginVertical: 8,
    fontFamily: 'Poppins-Medium',
    lineHeight: 21,
  },
});
