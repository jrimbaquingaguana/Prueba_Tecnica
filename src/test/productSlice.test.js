import { describe, it, expect, beforeEach, vi } from "vitest";
import reducer, {
  addLocalProduct,
  removeProduct,
  updateLocalProduct,
  setSearch,
  setSort,
  setPage,
  clearError,
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
} from "../redux/productSlice";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("productSlice reducers", () => {
  const initialState = {
    items: [],
    product: null,
    loading: false,
    saving: false,
    error: null,
    searchTerm: "",
    sortConfig: { key: "", direction: "asc" },
    page: 1,
    limit: 10,
    deletedIds: [],
  };

  it("addLocalProduct agrega un producto local", () => {
    const product = { title: "P1", price: 10 };
    const state = reducer(initialState, addLocalProduct(product));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].title).toBe("P1");
    expect(state.product.title).toBe("P1");
  });

  it("removeProduct elimina un producto y guarda id en deletedIds", () => {
    const stateWithItems = { ...initialState, items: [{ id: 1, title: "P1" }] };
    const state = reducer(stateWithItems, removeProduct(1));
    expect(state.items).toHaveLength(0);
    expect(state.deletedIds).toContain(1);
  });

  it("updateLocalProduct actualiza producto existente", () => {
    const stateWithItems = {
      ...initialState,
      items: [{ id: 1, title: "P1" }],
      product: { id: 1, title: "P1" },
    };
    const state = reducer(stateWithItems, updateLocalProduct({ title: "P1 updated" }));
    expect(state.items[0].title).toBe("P1 updated");
    expect(state.product.title).toBe("P1 updated");
  });

  it("setSearch, setSort, setPage, clearError funcionan correctamente", () => {
    let state = reducer(initialState, setSearch("abc"));
    expect(state.searchTerm).toBe("abc");
    expect(state.page).toBe(1);

    state = reducer(state, setSort({ key: "title", direction: "desc" }));
    expect(state.sortConfig.key).toBe("title");
    expect(state.page).toBe(1);

    state = reducer(state, setPage(3));
    expect(state.page).toBe(3);

    state = reducer({ ...state, error: "error" }, clearError());
    expect(state.error).toBeNull();
  });
});

describe("productSlice thunks", () => {
  const dispatch = vi.fn();
  const getState = () => ({ auth: { token: "token123" } });

  beforeEach(() => {
    dispatch.mockClear();
    mockFetch.mockClear();
  });

  it("fetchProducts.fulfilled carga productos", async () => {
    const products = [{ id: 1, title: "P1" }, { id: 2, title: "P2" }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ products }),
    });

    const thunk = fetchProducts();
    const result = await thunk(dispatch, getState, undefined);

    expect(result.payload).toEqual(
      products.map((p) => ({ ...p, price: 0, rating: 0, stock: 0, category: "", title: p.title }))
    );
  });

  it("fetchProduct.fulfilled carga un producto", async () => {
    const product = { id: 1, title: "P1" };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => product });

    const thunk = fetchProduct(1);
    const result = await thunk(dispatch, getState, undefined);

    expect(result.payload).toEqual(product);
  });

  it("createProduct.fulfilled crea producto", async () => {
    const newProduct = { id: 10, title: "New" };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => newProduct });

    const thunk = createProduct(newProduct);
    const result = await thunk(dispatch, getState, undefined);

    expect(result.payload).toEqual(newProduct);
  });

  it("updateProduct.fulfilled actualiza producto", async () => {
    const updatedProduct = { id: 10, title: "Updated" };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => updatedProduct });

    const thunk = updateProduct({ id: 10, product: updatedProduct });
    const result = await thunk(dispatch, getState, undefined);

    expect(result.payload).toEqual(updatedProduct);
  });
});
