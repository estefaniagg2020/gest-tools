import type { Product, Supplier } from "@/interfaces";
import { apiFetch } from "./apiClient";

export interface InventoryProductPayload {
  businessId: string;
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  price: number;
  cost: number;
  stockLevel: number;
  minStockLevel: number;
  supplierId?: string;
  isService: boolean;
}

const parseError = async (res: Response, fallback: string): Promise<Error> => {
  const data = await res.json().catch(() => ({}));
  const message =
    typeof data?.error === "string" && data.error.trim() !== ""
      ? data.error
      : fallback;
  return new Error(message);
};

export const inventoryApi = {
  getProducts: async (businessId: string): Promise<Product[]> => {
    const res = await apiFetch(
      `/api/inventory?businessId=${encodeURIComponent(businessId)}`,
    );
    if (!res.ok) throw await parseError(res, "Failed to fetch products");
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? (data as Product[]) : [];
  },

  getSuppliers: async (businessId: string): Promise<Supplier[]> => {
    const res = await apiFetch(
      `/api/inventory/suppliers?businessId=${encodeURIComponent(businessId)}`,
    );
    if (!res.ok) throw await parseError(res, "Failed to fetch suppliers");
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? (data as Supplier[]) : [];
  },

  createProduct: async (payload: InventoryProductPayload): Promise<Product> => {
    const res = await apiFetch("/api/inventory", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw await parseError(res, "Failed to save product");
    return (await res.json()) as Product;
  },

  updateProduct: async (
    id: string,
    payload: InventoryProductPayload,
  ): Promise<Product> => {
    const res = await apiFetch(`/api/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw await parseError(res, "Failed to save product");
    return (await res.json()) as Product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    const res = await apiFetch(`/api/inventory/${id}`, { method: "DELETE" });
    if (!res.ok) throw await parseError(res, "Failed to delete");
  },
};
