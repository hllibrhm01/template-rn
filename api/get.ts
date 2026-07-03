import { MeResponse } from "@/types/auth";
import { FeedbackListResponse, FeedbackQuery } from "@/types/feedback";
import { Session, SessionResponse } from "@/types/session";
import {
  NotificationListResponse,
  NotificationQuery,
} from "@/types/notification";
import { LegalDocument } from "@/types/legal";
import { instance } from "./config";

export async function getMe({ token }: { token: string }): Promise<MeResponse> {
  return instance
    .get("v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((r) => r.data);
}

export async function getFeedbacks(
  filters?: FeedbackQuery,
): Promise<FeedbackListResponse> {
  return instance.get("v1/feedback", { params: filters }).then((r) => r.data);
}

// Sessions
export async function getActiveSessions(): Promise<Session[]> {
  return instance.get("v1/sessions/active").then((r) => {
    const response = r.data as SessionResponse[];

    return response.map((item) => item.result);
  });
}

// Notifications
export async function getNotifications(
  filters?: NotificationQuery,
): Promise<NotificationListResponse> {
  return instance
    .get("v1/notifications", { params: filters })
    .then((r) => r.data);
}

// Legal
export async function getLegalDocuments({
  language,
}: {
  language?: string;
} = {}): Promise<LegalDocument[]> {
  return instance.get("v1/legal", { params: { language } }).then((r) => r.data);
}
