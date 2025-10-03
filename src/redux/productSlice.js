// src/redux/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// -------------------------
// Thunks asíncronos
// -------------------------
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (token, { rejectWithValue }) => {
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`https://dummyjson.com/products?limit=100`, { headers });
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();

      // Convertir campos numéricos correctamente
      const products = data.products.map((p) => ({
        ...p,
        price: Number(p.price ?? 0),
        rating: Number(p.rating ?? 0),
        stock: Number(p.stock ?? 0),
        title: p.title ?? "",
        category: p.category ?? "",
      }));

      return products;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

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

// -------------------------
// Slice principal
// -------------------------
const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    product: null,
    loading: false,
    saving: false,
    error: null,
    searchTerm: "",
    sortConfig: { key: "", direction: "asc" },
    page: 1,
    limit: 10,
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
    setSearch: (state, action) => {
      state.searchTerm = action.payload;
      state.page = 1; // reinicia la página al buscar
    },
    setSort: (state, action) => {
      state.sortConfig = action.payload;
      // Ajustar la página a 1 para evitar que se muestre vacía
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.page = 1; // aseguramos que la primera página se muestre
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchProduct
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateProduct
      .addCase(updateProduct.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.saving = false;
        state.product = action.payload;
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  removeProduct,
  updateLocalProduct,
  setSearch,
  setSort,
  setPage,
} = productSlice.actions;

export default productSlice.reducer;
