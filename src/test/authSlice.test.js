import { describe, it, expect, beforeEach, vi, beforeAll } from "vitest";
import reducer, { loginUser, loadStoredAuth, logout } from "../redux/authSlice.js";
import { configureStore } from "@reduxjs/toolkit";

beforeAll(() => {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { store = {}; },
    };
  })();
  global.localStorage = localStorageMock;
});

const createMockStore = (preloadedState) =>
  configureStore({
    reducer: { auth: reducer },
    preloadedState: { auth: preloadedState },
  });

describe("authSlice", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("loginUser exitoso guarda token y usuario en state y localStorage", async () => {
    const fakeResponse = {
      accessToken: "fakeToken",
      refreshToken: "fakeRefresh",
      id: 1,
      username: "johndoe",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      gender: "male",
      image: null,
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fakeResponse),
      })
    );

    const store = createMockStore({});

    await store.dispatch(loginUser({ username: "johndoe", password: "123456" }));

    const state = store.getState().auth;

    expect(state.user.username).toBe("johndoe");
    expect(state.token).toBe("fakeToken");
    expect(state.refreshToken).toBe("fakeRefresh");
    expect(state.showWelcome).toBe(true);

    const savedAuth = JSON.parse(localStorage.getItem("auth"));
    expect(savedAuth.token).toBe("fakeToken");
    expect(savedAuth.user.username).toBe("johndoe");
  });

  it("loginUser falla con error de credenciales", async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false }));

    const store = createMockStore({});

    await store.dispatch(loginUser({ username: "wrong", password: "wrong" }));

    const state = store.getState().auth;
    expect(state.error).toBe("Usuario o contraseña incorrectos");
    expect(state.loading).toBe(false);
  });

  it("loadStoredAuth carga auth desde localStorage", async () => {
    const authData = {
      token: "token123",
      refreshToken: "refresh123",
      user: { username: "johndoe" },
    };
    localStorage.setItem("auth", JSON.stringify(authData));

    const store = createMockStore({});

    await store.dispatch(loadStoredAuth());

    const state = store.getState().auth;
    expect(state.user.username).toBe("johndoe");
    expect(state.token).toBe("token123");
    expect(state.refreshToken).toBe("refresh123");
  });

  it("logout limpia state y localStorage", () => {
    const initialState = {
      user: { username: "johndoe" },
      token: "token123",
      refreshToken: "refresh123",
      showWelcome: true,
      loading: false,
      error: null,
    };

    const nextState = reducer(initialState, logout());

    expect(nextState.user).toBeNull();
    expect(nextState.token).toBeNull();
    expect(nextState.refreshToken).toBeNull();
    expect(nextState.showWelcome).toBe(false);
    expect(localStorage.getItem("auth")).toBeNull();
  });
});
