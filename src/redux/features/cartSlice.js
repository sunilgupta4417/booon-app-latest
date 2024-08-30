const SET_ADDRESS_LIST = 'SET_ADDRESS_LIST';
const SET_WISH_LIST = 'SET_WISH_LIST';
const SET_CART_LIST = 'SET_CART_LIST';
const RESET_STORE = 'RESET_STORE';
  
const INITIAL_STATE = {
      wishList: [],
      cartList: [],
      addressList:[],
      cart_count:0,
      wish_list_count:0
};
  
  export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'BAG_COUNT':
        return {...state,...action.payload};
      case SET_ADDRESS_LIST:
        return {...state, addressList: action.payload};
      case SET_CART_LIST:
        return {...state, cartList: action.payload};
      case SET_WISH_LIST:
        return {...state, addressList: action.payload};
      case RESET_STORE:
        return INITIAL_STATE;
      default:
        return state;
    }
  };
  