// src/redux/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const STORAGE_KEY = "products";
const DELETED_KEY = "deletedProducts";

const saveToLocalStorage = (products) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

const loadFromLocalStorage = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveDeletedIds = (ids) => {
  localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
};

const loadDeletedIds = () => {
  const data = localStorage.getItem(DELETED_KEY);
  return data ? JSON.parse(data) : [];
};

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`https://dummyjson.com/products?limit=200`, { headers });
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();

      return data.products.map((p) => ({
        ...p,
        price: Number(p.price ?? 0),
        rating: Number(p.rating ?? 0),
        stock: Number(p.stock ?? 0),
        title: p.title ?? "",
        category: p.category ?? "",
      }));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchProduct = createAsyncThunk(
  "products/fetchProduct",
  async (id, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
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
  async ({ id, product }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
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

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (product, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("https://dummyjson.com/products/add", {
        method: "POST",
        headers,
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error("Error al crear producto");
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: loadFromLocalStorage(),
    product: null,
    loading: false,
    saving: false,
    error: null,
    searchTerm: "",
    sortConfig: { key: "", direction: "asc" },
    page: 1,
    limit: 10,
    deletedIds: loadDeletedIds(),
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    addLocalProduct: (state, action) => {
      const newProduct = { ...action.payload, id: Date.now() };
      state.items.push(newProduct);
      state.product = newProduct;
      saveToLocalStorage(state.items);
    },

    removeProduct: (state, action) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
      state.deletedIds.push(action.payload);
      saveToLocalStorage(state.items);
      saveDeletedIds(state.deletedIds);
    },

    updateLocalProduct: (state, action) => {
      state.product = { ...state.product, ...action.payload };

      const idx = state.items.findIndex((p) => p.id === state.product.id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...state.product };

      saveToLocalStorage(state.items);
    },

    setSearch: (state, action) => {
      state.searchTerm = action.payload;
      state.page = 1;
    },
    setSort: (state, action) => {
      state.sortConfig = action.payload;
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const apiProducts = action.payload;
        const deletedIds = state.deletedIds;
        const filteredApi = apiProducts.filter((p) => !deletedIds.includes(p.id));
        const localProducts = state.items.filter((p) => !filteredApi.some((apiP) => apiP.id === p.id));
        state.items = [...filteredApi, ...localProducts];
        saveToLocalStorage(state.items);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

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

      .addCase(updateProduct.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.saving = false;
        state.product = action.payload;

        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;

        saveToLocalStorage(state.items);
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      .addCase(createProduct.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.saving = false;

        const exists = state.items.some((p) => p.id === action.payload.id);
        if (!exists) state.items.push(action.payload);

        state.product = action.payload;
        saveToLocalStorage(state.items);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const {
  addLocalProduct,
  clearError,
  removeProduct,
  updateLocalProduct,
  setSearch,
  setSort,
  setPage,
} = productSlice.actions;

export default productSlice.reducer;
