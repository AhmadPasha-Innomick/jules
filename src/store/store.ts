import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import passwordResetReducer from './passwordResetSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    passwordReset: passwordResetReducer,
  },
});


export type RootState = ReturnType<typeof store.getState>;


export type AppDispatch = typeof store.dispatch;

export default store;
