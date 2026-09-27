import type { NextApiRequest, NextApiResponse } from "next";
import { createApp } from "@aura/backend/src/app";
import { connectDatabase } from "@aura/backend/src/config/database";

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
      isConnected = true;
    } catch (err) {
      console.error("Vercel Serverless MongoDB Connection Error:", err);
    }
  }

  if (!app) {
    app = createApp();
  }

  return app(req, res);
}
