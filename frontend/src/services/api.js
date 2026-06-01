import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || "http://localhost:8000",
});

export const productsApi = {
  list: () => api.get("/products").then((r) => r.data),
  create: (data) => api.post("/products", data).then((r) => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`),
};

export const customersApi = {
  list: () => api.get("/customers").then((r) => r.data),
  create: (data) => api.post("/customers", data).then((r) => r.data),
  remove: (id) => api.delete(`/customers/${id}`),
};

export const ordersApi = {
  list: () => api.get("/orders").then((r) => r.data),
  create: (data) => api.post("/orders", data).then((r) => r.data),
  remove: (id) => api.delete(`/orders/${id}`),
};

export const statsApi = {
  dashboard: () => api.get("/stats/dashboard").then((r) => r.data),
};

export function getErrorMessage(error) {
  return error?.response?.data?.detail || error?.message || "Something went wrong";
}
