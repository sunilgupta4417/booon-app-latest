import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'

const Header = ({title,onPress}) => {
  return (
    <View style={styles.container}>
      {/* <TouchableOpacity onPress={onPress}>
        <Image style={styles.icon} source={require('../assets/back.png')}/>
      </TouchableOpacity>
      <Text style={styles.heading}>{title}</Text> */}
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
    container:{
        flexDirection:"row",
        padding:10,
        width:"90%",
    },
    icon:{
        width:32,
        height:32
    },
    heading:{
        fontSize:16,
        fontWeight:'500',
        margin:6,
        marginLeft:24
    }
})