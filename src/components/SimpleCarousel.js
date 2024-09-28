// SimpleCarousel.js
import React, {useState} from 'react';
import {Dimensions, FlatList, Image, StyleSheet, View} from 'react-native';
import {responsiveHeight} from '../utils';

const {width: viewportWidth} = Dimensions.get('window');

const SimpleCarousel = ({productDetail}) => {
  const [activeSlide, setActiveSlide] = useState(0);

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
    .slice(0, 7);

  const renderItem = ({item, index}) => (
    <Image
      key={index}
      source={{
        uri: `${productDetail?.images_url}/${productDetail?.product.seller_id}/${item.image}`,
      }}
      style={styles.image}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={uniqueArray}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / viewportWidth,
          );
          setActiveSlide(index);
        }}
      />
      <View style={styles.paginationContainer}>
        {uniqueArray.map((_, index) => (
          <View
            key={index.toString()}
            style={[
              styles.paginationDot,
              activeSlide === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default SimpleCarousel;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    height: responsiveHeight(620),
  },
  image: {
    width: viewportWidth,
    height: '100%',
    resizeMode: 'cover',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#11111173',
    borderRadius: 10,
    padding: 5,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: 'white',
  },
});
