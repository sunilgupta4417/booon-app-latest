import { getDistance } from 'geolib';
import moment from 'moment';
import {Dimensions} from 'react-native'

const heightMobileUI = 896;
const widthMobileUI = 414;

export const responsiveWidth = width => {
    return (Dimensions.get('window').width * width) / widthMobileUI;
  };
  
  export const responsiveHeight = height => {
    return (Dimensions.get('window').height * height) / heightMobileUI;
  };

  export function getDistanceFromLatLonInKm(
    currentUserLocation,
    warehouseLocation,
    timing
) {


  try {
    const { latitude, longitude } = currentUserLocation;
    const lat2 = warehouseLocation?.latitude;
    const lon2 = warehouseLocation?.longitude;
    const R = 6371;

    // Convert degrees to radians
    const toRadians = (degree) => degree * (Math.PI / 180);

    // console.log(latitude);
    // console.log(longitude);
    // console.log(lat2);
    // console.log(lon2);

    // Convert latitude and longitude from degrees to radians
    const lat1Rad = toRadians(latitude);
    const lon1Rad = toRadians(longitude);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);

    // Difference in coordinates
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;

    // Haversine formula
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in kilometers
    const distance = getDistance(
      { latitude: latitude, longitude: longitude },
      { latitude: lat2, longitude: lon2 }
    )/1000;
    
    const nowDate = new Date();
    const hour = nowDate.getHours().toString().padStart(2, '0');
    const minute = nowDate.getMinutes().toString().padStart(2, '0');
    
    const currentTime = `${hour}:${minute}:00`
    
    const checkIsTimeBetween = isTimeBetween(currentTime, timing?.startTime, timing?.endTime);

    if (distance >= 20) { 
      return  `Within next 4 hours`
      // return `Product not deliver to your address.`
    }


    if (checkIsTimeBetween) { 
      return distance <= 6 ? 'Within next 2 hours' : 'Within next 3-4 hours'
    } else {
      const tomorrow = moment().add(1, 'day').format('DD-MM-YYYY');
      const time = moment(timing?.startTime, 'HH:mm:ss');
      time.add(2, 'hours');
      const newTime = time.format('HH:mm:ss');
      return `Deliver by ${tomorrow} at ${newTime}`
    }
  } catch (error) {

    console.log(error,'errorerrorerrorerrorerror')
    return ''
  }
   
}

function isTimeBetween(current, start, end) {
  // Helper function to convert time string to minutes from midnight
  function timeToMinutes(time) {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
  }

  // Convert times to minutes from midnight
  const currentMinutes = timeToMinutes(current);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  // Check if the current time is between start and end times
  if (startMinutes <= endMinutes) {
      // When the end time is later in the day than the start time
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
      // When the end time is earlier in the day (crosses midnight)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
  