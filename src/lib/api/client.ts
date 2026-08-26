const API_BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data.data ?? data;
}

export const api = {
  // Products
  getProducts: (params?: Record<string, string>) => request(`/products?${new URLSearchParams(params || {})}`),
  getProduct: (id: string) => request(`/products/${id}`),
  createProduct: (body: unknown) => request("/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id: string, body: unknown) => request(`/products/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  // Categories
  getCategories: () => request("/categories"),
  createCategory: (body: unknown) => request("/categories", { method: "POST", body: JSON.stringify(body) }),
  updateCategory: (id: string, body: unknown) => request(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  // Sales
  getSales: (params?: Record<string, string>) => request(`/sales?${new URLSearchParams(params || {})}`),
  getSale: (id: string) => request(`/sales/${id}`),
  createSale: (body: unknown) => request("/sales", { method: "POST", body: JSON.stringify(body) }),
  voidSale: (id: string) => request(`/sales/${id}`, { method: "POST", body: JSON.stringify({ action: "void" }) }),

  // Inventory
  getInventory: (params?: Record<string, string>) => request(`/inventory?${new URLSearchParams(params || {})}`),
  updateInventoryItem: (id: string, body: unknown) => request(`/inventory/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  // Expenses
  getExpenses: (params?: Record<string, string>) => request(`/expenses?${new URLSearchParams(params || {})}`),
  getExpense: (id: string) => request(`/expenses/${id}`),
  createExpense: (body: unknown) => request("/expenses", { method: "POST", body: JSON.stringify(body) }),
  updateExpense: (id: string, body: unknown) => request(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteExpense: (id: string) => request(`/expenses/${id}`, { method: "DELETE" }),

  // Expense Categories
  getExpenseCategories: () => request("/expense-categories"),

  // Reports
  getReport: (type: string, params?: Record<string, string>) => request(`/reports?type=${type}&${new URLSearchParams(params || {})}`),

  // Settings
  getSettings: () => request("/settings"),
  updateSettings: (body: unknown) => request("/settings", { method: "PATCH", body: JSON.stringify(body) }),

  // Users
  getUsers: (params?: Record<string, string>) => request(`/users?${new URLSearchParams(params || {})}`),
  createUser: (body: unknown) => request("/users", { method: "POST", body: JSON.stringify(body) }),
  updateUser: (id: string, body: unknown) => request(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteUser: (id: string) => request(`/users/${id}`, { method: "DELETE" }),

  // Roles
  getRoles: () => request("/roles"),
};
