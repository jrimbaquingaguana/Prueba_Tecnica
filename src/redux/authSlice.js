import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Login con DummyJSON
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

      // Guardar solo lo esencial en localStorage
      const authData = {
        token: data.token,
        user: { id: data.id, username: data.username, firstName: data.firstName , image: data.image},
      };
      localStorage.setItem("auth", JSON.stringify(authData));

      return authData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Cargar auth desde localStorage
export const loadStoredAuth = createAsyncThunk("auth/loadStoredAuth", async () => {
  const storedAuth = localStorage.getItem("auth");
  return storedAuth ? JSON.parse(storedAuth) : null;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
    showWelcome: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
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
        state.showWelcome = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      });
  },
});

export const { logout, hideWelcome } = authSlice.actions;
export default authSlice.reducer;
