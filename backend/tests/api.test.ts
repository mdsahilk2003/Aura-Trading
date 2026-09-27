import request from "supertest";
import { describe, it, expect } from "vitest";
import { createApp } from "../src/app";
import { User } from "../src/models/User";
import { Order } from "../src/models/Order";
import { Watchlist } from "../src/models/Watchlist";

const app = createApp();

async function login(email: string, name?: string, role = "user") {
  const res = await request(app)
    .post("/api/auth/test-login")
    .send({ secret: "dev-test-auth-secret", email, name, role });
  expect(res.status).toBe(200);
  const cookie = res.headers["set-cookie"]?.[0];
  expect(cookie).toBeTruthy();
  return { cookie: cookie as string, user: res.body.data };
}

describe("Aura API", () => {
  it("health check", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("protects authenticated routes", async () => {
    const res = await request(app).get("/api/portfolio");
    expect(res.status).toBe(401);
  });

  it("market search comes from provider/db", async () => {
    const res = await request(app).get("/api/markets/search?q=REL");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((i: { symbol: string }) => i.symbol === "RELIANCE")).toBe(
      true
    );
  });

  it("returns historical OHLCV for chart", async () => {
    const res = await request(app).get("/api/markets/RELIANCE/history?timeframe=1D");
    expect(res.status).toBe(200);
    expect(res.body.data.bars.length).toBeGreaterThan(10);
    expect(res.body.data.mode).toBe("DEMO");
    expect(res.body.data.bars[0]).toHaveProperty("open");
    expect(res.body.data.bars[0]).toHaveProperty("volume");
  });

  it("watchlist is user-scoped", async () => {
    const a = await login("usera@test.com", "User A");
    const b = await login("userb@test.com", "User B");

    await request(app)
      .post("/api/watchlist")
      .set("Cookie", a.cookie)
      .send({ symbol: "HDFCBANK" })
      .expect(201);

    const aList = await request(app).get("/api/watchlist").set("Cookie", a.cookie);
    const bList = await request(app).get("/api/watchlist").set("Cookie", b.cookie);
    expect(aList.body.data.some((i: { symbol: string }) => i.symbol === "HDFCBANK")).toBe(
      true
    );
    expect(bList.body.data.some((i: { symbol: string }) => i.symbol === "HDFCBANK")).toBe(
      false
    );
  });

  it("places market order and updates portfolio", async () => {
    const a = await login("trader@test.com", "Trader");
    const before = await request(app).get("/api/portfolio").set("Cookie", a.cookie);
    expect(before.body.data.availableFunds).toBeGreaterThan(0);

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Cookie", a.cookie)
      .send({
        symbol: "RELIANCE",
        side: "BUY",
        orderType: "MARKET",
        quantity: 2,
      });
    expect(orderRes.status).toBe(201);
    expect(orderRes.body.data.status).toBe("FILLED");

    const holdings = await request(app)
      .get("/api/portfolio/holdings")
      .set("Cookie", a.cookie);
    expect(holdings.body.data.some((h: { symbol: string }) => h.symbol === "RELIANCE")).toBe(
      true
    );

    const after = await request(app).get("/api/portfolio").set("Cookie", a.cookie);
    expect(after.body.data.availableFunds).toBeLessThan(before.body.data.availableFunds);
  });

  it("prevents IDOR on orders", async () => {
    const a = await login("idor-a@test.com", "A");
    const b = await login("idor-b@test.com", "B");

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Cookie", a.cookie)
      .send({
        symbol: "INFY",
        side: "BUY",
        orderType: "MARKET",
        quantity: 1,
      });
    const orderId = orderRes.body.data.id;

    const stolen = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("Cookie", b.cookie);
    expect(stolen.status).toBe(404);

    const own = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("Cookie", a.cookie);
    expect(own.status).toBe(200);
  });

  it("validates order payload", async () => {
    const a = await login("validate@test.com");
    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", a.cookie)
      .send({
        symbol: "RELIANCE",
        side: "BUY",
        orderType: "LIMIT",
        quantity: 1,
      });
    expect(res.status).toBe(422);
  });

  it("risk manager blocks oversized buy", async () => {
    const a = await login("risk@test.com");
    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", a.cookie)
      .send({
        symbol: "RELIANCE",
        side: "BUY",
        orderType: "MARKET",
        quantity: 1_000_000,
      });
    expect([422, 400]).toContain(res.status);
  });

  it("admin route requires admin role", async () => {
    const user = await login("plain@test.com");
    const denied = await request(app)
      .get("/api/admin/dashboard")
      .set("Cookie", user.cookie);
    expect(denied.status).toBe(403);

    const admin = await login("admin@test.com", "Admin", "admin");
    const ok = await request(app)
      .get("/api/admin/dashboard")
      .set("Cookie", admin.cookie);
    expect(ok.status).toBe(200);
  });

  it("bot starts in paper mode", async () => {
    const a = await login("bot@test.com");
    const res = await request(app)
      .post("/api/bot/start")
      .set("Cookie", a.cookie)
      .send({
        strategy: "MA_CROSSOVER",
        capital: 50000,
        maxDailyLoss: 2000,
        symbols: ["RELIANCE"],
      });
    expect(res.status).toBe(200);
    expect(res.body.data.mode).toBe("PAPER");
    expect(res.body.data.status).toBe("RUNNING");

    const stop = await request(app).post("/api/bot/stop").set("Cookie", a.cookie);
    expect(stop.body.data.status).toBe("STOPPED");
  });

  it("isolates notifications between users", async () => {
    const a = await login("nota@test.com");
    await request(app)
      .post("/api/orders")
      .set("Cookie", a.cookie)
      .send({
        symbol: "ITC",
        side: "BUY",
        orderType: "MARKET",
        quantity: 1,
      });
    const aNotes = await request(app)
      .get("/api/notifications")
      .set("Cookie", a.cookie);
    const b = await login("notb@test.com");
    const bNotes = await request(app)
      .get("/api/notifications")
      .set("Cookie", b.cookie);
    expect(aNotes.body.data.length).toBeGreaterThan(0);
    expect(bNotes.body.data.length).toBe(0);
  });
});

describe("Auth session", () => {
  it("returns current user via /me", async () => {
    const a = await login("me@test.com", "Me User");
    const res = await request(app).get("/api/auth/me").set("Cookie", a.cookie);
    expect(res.body.data.email).toBe("me@test.com");
  });

  it("logout revokes access", async () => {
    const a = await login("logout@test.com");
    await request(app).post("/api/auth/logout").set("Cookie", a.cookie).expect(200);
    const me = await request(app).get("/api/auth/me").set("Cookie", a.cookie);
    expect(me.status).toBe(401);
  });
});

describe("Portfolio calculation", () => {
  it("computes invested and pnl from holdings", async () => {
    const a = await login("pnl@test.com");
    await request(app)
      .post("/api/orders")
      .set("Cookie", a.cookie)
      .send({
        symbol: "WIPRO",
        side: "BUY",
        orderType: "MARKET",
        quantity: 10,
      });
    const portfolio = await request(app).get("/api/portfolio").set("Cookie", a.cookie);
    expect(portfolio.body.data.invested).toBeGreaterThan(0);
    expect(portfolio.body.data).toHaveProperty("overallPnl");
    expect(portfolio.body.data.mode).toBe("PAPER");
  });
});

// Ensure models are referenced so TS doesn't strip imports in some setups
void User;
void Order;
void Watchlist;
