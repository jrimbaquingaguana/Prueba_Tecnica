// src/redux/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Obtener todos los productos
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (token, { rejectWithValue }) => {
    try {
      const headers = { "Content-Type": "application/json" };
      // Incluir token si existe
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`https://dummyjson.com/products?limit=100`, { headers });
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      return data.products;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Obtener un producto por id
export const fetchProduct = createAsyncThunk(
  "products/fetchProduct",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`https://dummyjson.com/products/${id}`, { headers });
      if (!res.ok) throw new Error("No se pudo cargar el producto");
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Actualizar un producto
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, token, product }, { rejectWithValue }) => {
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`https://dummyjson.com/products/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error("Error al actualizar producto");
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],       // Lista de productos
    product: null,   // Producto individual para detalle o edición
    loading: false,  // Estado de carga de lista
    saving: false,   // Estado de carga al actualizar
    error: null,     // Mensajes de error
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    removeProduct: (state, action) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    updateLocalProduct: (state, action) => {
      state.product = { ...state.product, ...action.payload };
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // fetchProduct
      .addCase(fetchProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.loading = false; state.product = action.payload; })
      .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // updateProduct
      .addCase(updateProduct.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.saving = false;
        state.product = action.payload;
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => { state.saving = false; state.error = action.payload; });
  },
});

export const { clearError, removeProduct, updateLocalProduct } = productSlice.actions;
export default productSlice.reducer;
