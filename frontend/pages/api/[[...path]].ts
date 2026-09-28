import type { NextApiRequest, NextApiResponse } from "next";
import { createApp } from "@aura/backend/src/app";
import { connectDatabase } from "@aura/backend/src/config/database";
import { seedInstruments } from "@aura/backend/src/utils/seed";

let app: any = null;
let isConnected = false;

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isConnected) {
    try {
      await connectDatabase();
      await seedInstruments();
      isConnected = true;
    } catch (err: any) {
      console.error("Vercel Serverless MongoDB Connection Error:", err);
      const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const redirectBase = `${protocol}://${host}`;
      if (req.url?.includes("/api/auth/google/callback")) {
        return res.redirect(`${redirectBase}/login?error=oauth_failed&reason=${encodeURIComponent(err?.message || "MongoDB connection failed")}`);
      }
    }
  }

  if (!app) {
    app = createApp();
  }

  return app(req, res);
}
