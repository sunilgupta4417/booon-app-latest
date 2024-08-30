import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  addressList:[]
}

const SplashSlice = createSlice({
  name: 'splash',
  initialState,
  reducers: {
    flash(state, action) {
        // console.log(action.payload,'<<==')
      state.data = action.payload
    },
    AddUserAddress:(state,action)=>{
        console.log(action.payload,'userAddressStore')
        state.userAddress = action.payload
    },
    setUserAddressList: () => { 
      console.log(action.payload,'setUserAddressList')
      state.addressList = action.payload
    }
  },
})

export const { flash, AddUserAddress, setUserAddressList } = SplashSlice.actions
export default SplashSlice.reducer