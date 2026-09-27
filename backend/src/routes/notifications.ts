import { Router } from "express";
import { asyncHandler, requireAuth, type AuthRequest } from "../middleware/auth";
import { success, AppError } from "../utils/errors";
import { ERROR_CODES } from "@aura/shared";
import { Notification } from "../models/Notification";

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const items = await Notification.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json(
      success(
        items.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          read: n.read,
          createdAt: n.createdAt.toISOString(),
          meta: n.meta,
        }))
      )
    );
  })
);

notificationsRouter.patch(
  "/:id/read",
  asyncHandler(async (req: AuthRequest, res) => {
    const n = await Notification.findOne({
      _id: req.params.id,
      userId: req.user!.id,
    });
    if (!n) throw new AppError("Notification not found", 404, ERROR_CODES.NOT_FOUND);
    n.read = true;
    await n.save();
    return res.json(
      success({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
        meta: n.meta,
      })
    );
  })
);
