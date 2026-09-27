import type {
  ModifyOrderRequest,
  OrderDto,
  OrderSide,
  OrderStatus,
  PlaceOrderRequest,
} from "@aura/shared";
import { apiFetch } from "@/lib/api";

export interface OrdersListParams {
  page?: number;
  limit?: number;
  side?: OrderSide;
  status?: OrderStatus;
  search?: string;
}

export interface OrdersListResponse {
  orders: OrderDto[];
  total: number;
  page: number;
  limit: number;
}

function toQuery(params: OrdersListParams) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.side) q.set("side", params.side);
  if (params.status) q.set("status", params.status);
  if (params.search) q.set("search", params.search);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const ordersService = {
  list: (params: OrdersListParams = {}) =>
    apiFetch<OrdersListResponse>(`/api/orders${toQuery(params)}`),
  getOrders: (params: OrdersListParams = {}) =>
    apiFetch<OrdersListResponse>(`/api/orders${toQuery(params)}`),

  get: (id: string) => apiFetch<OrderDto>(`/api/orders/${id}`),

  place: (body: PlaceOrderRequest) =>
    apiFetch<OrderDto>("/api/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  placeOrder: (body: PlaceOrderRequest) =>
    apiFetch<OrderDto>("/api/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  modify: (id: string, body: ModifyOrderRequest) =>
    apiFetch<OrderDto>(`/api/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  modifyOrder: (id: string, body: ModifyOrderRequest) =>
    apiFetch<OrderDto>(`/api/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  cancel: (id: string) =>
    apiFetch<OrderDto>(`/api/orders/${id}`, { method: "DELETE" }),
  cancelOrder: (id: string) =>
    apiFetch<OrderDto>(`/api/orders/${id}`, { method: "DELETE" }),
};
