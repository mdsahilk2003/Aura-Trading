import type { NotificationDto } from "@aura/shared";
import { apiFetch } from "@/lib/api";

export const notificationsService = {
  list: () => apiFetch<NotificationDto[]>("/api/notifications"),

  markRead: (id: string) =>
    apiFetch<NotificationDto>(`/api/notifications/${id}/read`, {
      method: "PATCH",
    }),
};
