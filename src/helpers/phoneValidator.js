export default function phoneValidator(phone){
    if (!phone){
        return "Number can't be empty.";
    }
    
    if (phone.length !== 10) {
        return "Number must be 10 digits long.";
    }
    
    if (!/^\d+$/.test(phone)) {
        return "Number must contain only digits.";
    }
    
    return '';
}



function haversineDistance(lat1, lon1, lat2, lon2) {
    // Convert degrees to radians
    function toRadians(degrees) {
      return degrees * (Math.PI / 180);
    }
  
    // Radius of the Earth in kilometers
    const R = 6371;
  
    // Difference in coordinates
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
  
    // Convert latitude to radians
    const radLat1 = toRadians(lat1);
    const radLat2 = toRadians(lat2);
  
    // Haversine formula
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(radLat1) *
        Math.cos(radLat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    // Distance in kilometers
    const distance = R * c;
  
    return distance;
  }
  

  export {haversineDistance}