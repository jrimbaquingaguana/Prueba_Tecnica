// store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import productReducer from "./productSlice"; // asegúrate que existe

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer, // este nombre será la "key" en el estado global
  },
});

export default store;
