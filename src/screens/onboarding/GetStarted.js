import { Dimensions, Image, ImageBackground, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import ButtonComp from '../../components/ButtonComp';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';

const { width: viewportWidth, height } = Dimensions.get('window');

const GetStarted = ({ navigation }) => {
    const {Screen} = useSelector((state)=>state.splash.data.data)
    // console.log(Screen,'Screen')
    const carouselRef = useRef(null);
    const [activeSlide, setActiveSlide] = useState(0);
    // const data = [
    //     { txt: "Explore 100K+ Trendy Styles from Your Favourite Brands. Delivered in 2 Hours!", img: require('../../assets/cover.png') },
    //     { txt: "Explore 100K+ Trendy Styles from Your Favourite Brands. Delivered in 2 Hours!", img: require('../../assets/cover2.png') },
    //     { txt: "Explore 100K+ Trendy Styles from Your Favourite Brands. Delivered in 2 Hours!", img: require('../../assets/cover1.png') }
    // ];

    useEffect(() => {
        const interval = setInterval(() => {
            if (carouselRef.current) {
                const nextIndex = (activeSlide + 1) % Screen.length;
                setActiveSlide(nextIndex);
                carouselRef.current.snapToItem(nextIndex);
            }
        }, 3000); // Change slide every 3 seconds

        return () => clearInterval(interval);
    }, [activeSlide]);

    const renderItem = ({ item }) => {
        // console.log(item,'itemm')
        return(
        <ImageBackground
            source={{uri:item.image}}
            style={styles.bgImg}
        >
            <LinearGradient
                colors={['#00000000', '#000000']} // Transparent to black gradient
                style={styles.gradient}
            >
                <View style={styles.carouselItem}>
                    <Image style={{ height: 28, width: 117, margin: 20 }} source={require('../../assets/boonLogo.png')} />
                    <Text numberOfLines={3} style={styles.subtitle}>
                        {item.detail}
                        {/* Explore <Text style={{ fontWeight: '800' }}>100K+</Text> Trendy Styles from Your Favourite Brands. Delivered in <Text style={{ fontWeight: '800' }}>2 Hours!</Text> */}
                    </Text>
                </View>
            </LinearGradient>
        </ImageBackground>
    )};

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <View style={styles.carouselWrapper}>
                <Carousel
                    ref={carouselRef}
                    data={Screen}
                    renderItem={renderItem}
                    sliderWidth={viewportWidth}
                    itemWidth={viewportWidth}
                    layout={'default'}
                    onSnapToItem={(index) => setActiveSlide(index)}
                />
                <Pagination
                    dotsLength={Screen.length}
                    activeDotIndex={activeSlide}
                    containerStyle={styles.paginationContainer}
                    dotContainerStyle={styles.paginationDotContainer}
                    dotStyle={styles.paginationDot}
                    inactiveDotStyle={styles.inactiveDot}
                    inactiveDotOpacity={0.4}
                    inactiveDotScale={0.6}
                />
            </View>
            <View style={styles.buttonContainer}>
                <ButtonComp
                    color={"white"}
                    bdrColor={"white"}
                    title={"Get Started"}
                    txtColor={"#111111"}
                    // onPress={() => navigation.navigate('Login',{
                    //     regiration:true
                    // })}
                    onPress={() => navigation.navigate('SelectLocation')}
                />
            </View>
        </SafeAreaView>
    );
}

export default GetStarted;

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
        backgroundColor: "#000",
    },
    bgImg: {
        width: viewportWidth,
        height: height,
        resizeMode: "cover",
        justifyContent: 'center',
    },
    gradient: {
        position: 'absolute',
        width: viewportWidth,
        height: height,
        bottom: 0,
        justifyContent: "flex-end"
    },
    carouselWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    carouselItem: {
        alignItems: "center",
        margin: 10,
        marginBottom: height / 3.5,
        width: viewportWidth - 150,
        height: 90,
        alignSelf: "center",
        justifyContent: "flex-end",
    },
    title: {
        fontSize: 32,
        fontWeight: "500",
        color: "white",
    },
    subtitle: {
        color: "white",
        fontSize: 16,
        fontWeight: '400',
        textAlign: "center",
        alignSelf: "center",
        fontFamily: 'Poppins',
        lineHeight: 24
    },
    paginationContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.0)',
        paddingVertical: 8,
        position: 'absolute',
        alignSelf: "center",
        bottom: 130, // Adjust this value to move the dots up
    },
    paginationDotContainer: {
        marginHorizontal: 4,
    },
    paginationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
    },
    inactiveDot: {
        // Define styles for inactive dots here
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 60,
        width: '100%',
        alignItems: 'center',
    },
});
