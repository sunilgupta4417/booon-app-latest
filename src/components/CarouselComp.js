import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useState} from 'react';
import Carousel, {Pagination} from 'react-native-snap-carousel';
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
  let uniqueArray = productDetail?.images.filter(item => {
    if (seen.has(item.image)) {
      return false;
    } else {
      seen.add(item.image);
      return true;
    }
  }).slice(0, 6);

  console.log(uniqueArray,'uniqueArray9347934wiwiweuewi')
  return (
    <View style={{marginBottom: 10}}>
      <Carousel
        data={uniqueArray}
        renderItem={renderItem2}
        sliderWidth={viewportWidth}
        itemWidth={viewportWidth}
        layout={'default'}
        onSnapToItem={index => setActiveSlide(index)}
      />
      <Pagination
        dotsLength={uniqueArray.length}
        activeDotIndex={activeSlide}
        containerStyle={styles.paginationContainer}
        dotContainerStyle={styles.paginationDotContainer}
        dotStyle={styles.paginationDot}
        inactiveDotStyle={styles.inactiveDot}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.8}
      />
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
    // maxWidth:'58%',
    // overflow:'hidden'
  },
  paginationDotContainer: {
    marginHorizontal: 2,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
    backgroundColor: 'white',
  },
  inactiveDot: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 4,
    borderColor: 'white',
  },
  carouselItem: {
    backgroundColor: 'lightgray',
    // borderRadius: 10,
    height: responsiveHeight(620),
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 25,
  },
});
