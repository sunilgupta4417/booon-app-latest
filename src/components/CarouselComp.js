import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useState} from 'react';
import Carousel from 'react-native-reanimated-carousel';
import {responsiveHeight} from '../utils';

const {width: viewportWidth, height} = Dimensions.get('window');
const CarouselComp = ({productDetail}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const renderItem2 = ({item}) => (
    <ImageBackground
      source={{
        uri: `${productDetail?.images_url}/${productDetail?.product.seller_id}/${item.image}`,
      }}
      style={styles.carouselItem}></ImageBackground>
  );

  let seen = new Set();
  let uniqueArray = productDetail?.images
    .filter(item => {
      if (seen.has(item.image)) {
        return false;
      } else {
        seen.add(item.image);
        return true;
      }
    })
    .slice(0, 6);
 
  return (
    <View style={{marginBottom: 10}}>
      <Carousel
        loop={false}
        data={uniqueArray}
        renderItem={renderItem2}
        autoPlay={false}
        windowSize={viewportWidth}
        width={viewportWidth}
        height={responsiveHeight(610)}
        // scrollAnimationDuration={1000}
        snapEnabled = {true}
        onSnapToItem={(index) => setActiveSlide(index)}
        pagingEnabled={true}
      />
      <View style={styles.paginationContainer}>
        {uniqueArray.map((_, index) => (
          <View
            key={index.toString()}
            style={[
              styles.paginationDot,
              activeSlide === index && {backgroundColor: 'white'},
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default CarouselComp;

const styles = StyleSheet.create({
  paginationContainer: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: '#11111173',
    borderRadius: 10,
    flexDirection: 'row',
    borderWidth: 0
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  carouselItem: {
    backgroundColor: 'lightgray',
    height: responsiveHeight(620),
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 25,
  },
});
