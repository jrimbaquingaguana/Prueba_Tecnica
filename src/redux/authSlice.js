// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// -------------------------
// Login con DummyJSON
// -------------------------
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const res = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Usuario o contraseña incorrectos");

      const data = await res.json();

      // Verificamos que el accessToken exista
      if (!data.accessToken) throw new Error("No se recibió accessToken del servidor");

      // Guardar token y usuario en localStorage
      const authData = {
        token: data.accessToken,        // aquí usamos accessToken
        refreshToken: data.refreshToken, // opcional
        user: {
          id: data.id,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          gender: data.gender,
          image: data.image || null,
        },
      };
      localStorage.setItem("auth", JSON.stringify(authData));

      return authData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// -------------------------
// Cargar auth desde localStorage
// -------------------------
export const loadStoredAuth = createAsyncThunk(
  "auth/loadStoredAuth",
  async () => {
    const storedAuth = localStorage.getItem("auth");
    return storedAuth ? JSON.parse(storedAuth) : null;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    refreshToken: null,
    loading: false,
    error: null,
    showWelcome: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.showWelcome = false;
      localStorage.removeItem("auth");
    },
    hideWelcome: (state) => {
      state.showWelcome = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.showWelcome = true;
        // Guardamos nuevamente en localStorage
        localStorage.setItem("auth", JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
        }
      });
  },
});

export const { logout, hideWelcome } = authSlice.actions;
export default authSlice.reducer;
