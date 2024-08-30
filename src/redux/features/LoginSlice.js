import { createSlice } from '@reduxjs/toolkit'

const initialState= {data:{}}
const LoginSlice = createSlice({
  name: 'Login',
  initialState,
  reducers: {
    login(state, action) {
      state.data= action.payload
    },
    // todoToggled(state, action) {
    //   const todo = state.find((todo) => todo.id === action.payload)
    //   todo.completed = !todo.completed
    // },
  },
})

export const { login } = LoginSlice.actions
export default LoginSlice.reducer