import { configureStore } from '@reduxjs/toolkit'
import SplashReducer from '../features/SplashSlice'
import LoginReducer from '../features/LoginSlice'
import cartSlice from '../features/cartSlice'
// import { login } from '../features/LoginSlice'
// import { flash } from '../features/SplashSlice'

export const store = configureStore({
  reducer: {
    splash: SplashReducer,
    Login: LoginReducer,
    Cart: cartSlice
  },
})