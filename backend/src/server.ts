import http from "http";
import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { seedInstruments } from "./utils/seed";
import { createWebsocketServer } from "./websocket";

async function main() {
  await connectDatabase();
  await seedInstruments();

  const app = createApp();
  const server = http.createServer(app);
  createWebsocketServer(server);

  server.listen(env.PORT, () => {
    console.log(`Aura API listening on :${env.PORT}`);
    console.log(`Market provider: ${env.MARKET_DATA_PROVIDER}`);
    console.log(`Broker provider: ${env.BROKER_PROVIDER}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
