import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { DesignRequest, PaymentRecord, Review } from "../types";

interface DatabaseSchema {
  requests: DesignRequest[];
  payments: PaymentRecord[];
  reviews: Review[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "agency.json");

const LEGACY_KEY = "agency:db";
const K_REQ_LIST = "agency:reqs";
const K_PAY_LIST = "agency:pays";
const K_REV_LIST = "agency:reviews";
const K_INIT = "agency:init";

const kvEnv = (): { url: string | undefined; token: string | undefined } => {
  const url = process.env.UPSTASH_REDIS_REST_URL
    || process.env.KV_REST_API_URL
    || process.env.REDIS_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
    || process.env.KV_REST_API_TOKEN
    || process.env.REDIS_REST_API_TOKEN;
  return { url, token };
};
export { kvEnv };

const kvBackendActive = (): boolean => {
  const env = kvEnv();
  return Boolean(env.url && env.token);
};

export const kvBackendName = (): string => {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) return "upstash";
  if (
    (process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL) &&
    (process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN)
  ) {
    return "vercel-kv";
  }
  return "local-fs";
};

export class DatabaseStore {
  private kv = (): Redis => {
    const env = kvEnv();
    return new Redis({ url: env.url as string, token: env.token as string });
  };

  private reqKey = (id: string): string => `agency:req:${id}`;
  private payKey = (id: string): string => `agency:pay:${id}`;
  private revKey = (id: string): string => `agency:rev:${id}`;

  private async ensureInitialized(): Promise<void> {
    if ((await this.kv().setnx(K_INIT, "1")) !== 1) return;

    try {
      const legacy = await this.kv().get<DatabaseSchema>(LEGACY_KEY);
      if (legacy) {
        for (const req of legacy.requests || []) {
          await this.kv().set(this.reqKey(req.id), JSON.stringify(req));
          await this.kv().lpush(K_REQ_LIST, req.id);
        }
        for (const pay of legacy.payments || []) {
          await this.kv().set(this.payKey(pay.paymentId), JSON.stringify(pay));
          await this.kv().lpush(K_PAY_LIST, pay.paymentId);
        }
        for (const rev of legacy.reviews || []) {
          await this.kv().set(this.revKey(rev.id), JSON.stringify(rev));
          await this.kv().lpush(K_REV_LIST, rev.id);
        }
      }
    } catch (err) {
      console.error("Failed to migrate legacy KV document:", err);
    }
    await this.kv().del(LEGACY_KEY);
  }

  private async kvLoadRequests(): Promise<DesignRequest[]> {
    await this.ensureInitialized();
    const ids = await this.kv().lrange<string>(K_REQ_LIST, 0, -1);
    if (!ids) return [];
    const seen = new Set<string>();
    const out: DesignRequest[] = [];
    for (const id of ids) {
      if (seen.has(id)) continue;
      seen.add(id);
      const item = await this.kv().get<DesignRequest>(this.reqKey(id));
      if (item) out.push(item);
    }
    return out;
  }

  private async kvLoadPayments(): Promise<PaymentRecord[]> {
    await this.ensureInitialized();
    const ids = await this.kv().lrange<string>(K_PAY_LIST, 0, -1);
    if (!ids) return [];
    const seen = new Set<string>();
    const out: PaymentRecord[] = [];
    for (const id of ids) {
      if (seen.has(id)) continue;
      seen.add(id);
      const item = await this.kv().get<PaymentRecord>(this.payKey(id));
      if (item) out.push(item);
    }
    return out;
  }

  private async kvLoadReviews(): Promise<Review[]> {
    await this.ensureInitialized();
    const ids = await this.kv().lrange<string>(K_REV_LIST, 0, -1);
    if (!ids) return [];
    const seen = new Set<string>();
    const out: Review[] = [];
    for (const id of ids) {
      if (seen.has(id)) continue;
      seen.add(id);
      const item = await this.kv().get<Review>(this.revKey(id));
      if (item) out.push(item);
    }
    return out;
  }

  private fsLoad(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(DB_FILE)) {
        const data: DatabaseSchema = { requests: [], payments: [], reviews: [] };
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
        return data;
      }
      const raw = fs.readFileSync(DB_FILE, "utf8");
      const parsed = JSON.parse(raw) as DatabaseSchema;
      return {
        requests: parsed.requests || [],
        payments: parsed.payments || [],
        reviews: parsed.reviews || [],
      };
    } catch (err) {
      console.error("Failed to read store:", err);
      return { requests: [], payments: [], reviews: [] };
    }
  }

  private fsSave(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to save store:", err);
    }
  }

  // --- Requests ---
  async getAllRequests(): Promise<DesignRequest[]> {
    if (kvBackendActive()) {
      return (await this.kvLoadRequests()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return this.fsLoad().requests.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getRequestById(id: string): Promise<DesignRequest | null> {
    if (kvBackendActive()) {
      await this.ensureInitialized();
      return (await this.kv().get<DesignRequest>(this.reqKey(id))) ?? null;
    }
    return this.fsLoad().requests.find((r) => r.id === id) || null;
  }

  async createRequest(
    input: Omit<DesignRequest, "id" | "status" | "createdAt" | "updatedAt">
  ): Promise<DesignRequest> {
    const id = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newReq: DesignRequest = {
      ...input,
      id,
      status: "pending_quote",
      createdAt: now,
      updatedAt: now,
    };

    if (kvBackendActive()) {
      await this.ensureInitialized();
      await this.kv().set(this.reqKey(id), JSON.stringify(newReq));
      await this.kv().lpush(K_REQ_LIST, id);
      return newReq;
    }

    const data = this.fsLoad();
    data.requests.unshift(newReq);
    this.fsSave(data);
    return newReq;
  }

  async updateRequest(id: string, updates: Partial<DesignRequest>): Promise<DesignRequest | null> {
    if (kvBackendActive()) {
      const existing = await this.getRequestById(id);
      if (!existing) return null;
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      await this.kv().set(this.reqKey(id), JSON.stringify(updated));
      return updated;
    }

    const data = this.fsLoad();
    const index = data.requests.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updated = { ...data.requests[index], ...updates, updatedAt: new Date().toISOString() };
    data.requests[index] = updated;
    this.fsSave(data);
    return updated;
  }

  // --- Payments ---
  async getAllPayments(): Promise<PaymentRecord[]> {
    if (kvBackendActive()) {
      return (await this.kvLoadPayments()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return this.fsLoad().payments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPaymentById(paymentId: string): Promise<PaymentRecord | null> {
    if (kvBackendActive()) {
      await this.ensureInitialized();
      return (await this.kv().get<PaymentRecord>(this.payKey(paymentId))) ?? null;
    }
    return this.fsLoad().payments.find((p) => p.paymentId === paymentId) || null;
  }

  async getPaymentByRequestId(requestId: string): Promise<PaymentRecord | null> {
    const payments = kvBackendActive() ? await this.kvLoadPayments() : this.fsLoad().payments;
    return payments.find((p) => p.requestId === requestId) || null;
  }

  async savePayment(record: PaymentRecord): Promise<PaymentRecord> {
    if (kvBackendActive()) {
      await this.ensureInitialized();
      await this.kv().set(this.payKey(record.paymentId), JSON.stringify(record));
      await this.kv().lpush(K_PAY_LIST, record.paymentId);
      return record;
    }

    const data = this.fsLoad();
    const existingIndex = data.payments.findIndex((p) => p.paymentId === record.paymentId);
    if (existingIndex >= 0) {
      data.payments[existingIndex] = record;
    } else {
      data.payments.unshift(record);
    }
    this.fsSave(data);
    return record;
  }

  async reconcilePayment(
    paymentId: string,
    status: "payment_successful" | "payment_failed" | "pending",
    payerRouting?: string,
    payerName?: string
  ): Promise<{ payment: PaymentRecord | null; request: DesignRequest | null }> {
    if (kvBackendActive()) {
      await this.ensureInitialized();
      let payment = await this.getPaymentById(paymentId);
      let request: DesignRequest | null = null;

      if (payment) {
        payment.status = status;
        if (payerRouting) payment.payerRouting = payerRouting;
        if (payerName) payment.payerName = payerName;
        if (status === "payment_successful") {
          payment.paidAt = new Date().toISOString();
        }
        await this.kv().set(this.payKey(paymentId), JSON.stringify(payment));

        request = payment.requestId ? await this.getRequestById(payment.requestId) : null;
        if (request) {
          if (status === "payment_successful") request.status = "paid";
          request.updatedAt = new Date().toISOString();
          await this.kv().set(this.reqKey(request.id), JSON.stringify(request));
        }
        return { payment, request };
      }

      request =
        (await this.getAllRequests()).find((r) => r.fleecaPaymentId === paymentId) || null;
      if (request && request.fleecaPaymentId === paymentId) {
        const newRecord: PaymentRecord = {
          paymentId,
          requestId: request.id,
          amount: request.quoteAmount || 0,
          mode: 0,
          description: `Deposit for ${request.id}`,
          status,
          payerRouting,
          payerName,
          createdAt: new Date().toISOString(),
          paidAt: status === "payment_successful" ? new Date().toISOString() : undefined,
        };
        await this.kv().set(this.payKey(paymentId), JSON.stringify(newRecord));
        await this.kv().lpush(K_PAY_LIST, paymentId);

        if (status === "payment_successful") request.status = "paid";
        request.updatedAt = new Date().toISOString();
        await this.kv().set(this.reqKey(request.id), JSON.stringify(request));
        return { payment: newRecord, request };
      }
      return { payment: null, request: null };
    }

    const data = this.fsLoad();
    let payment = data.payments.find((p) => p.paymentId === paymentId) || null;
    let request: DesignRequest | null = null;

    if (payment) {
      payment.status = status;
      if (payerRouting) payment.payerRouting = payerRouting;
      if (payerName) payment.payerName = payerName;
      if (status === "payment_successful") {
        payment.paidAt = new Date().toISOString();
      }

      request = data.requests.find((r) => r.id === payment?.requestId) || null;
      if (request) {
        if (status === "payment_successful") {
          request.status = "paid";
        }
        request.updatedAt = new Date().toISOString();
      }
    } else {
      request = data.requests.find((r) => r.fleecaPaymentId === paymentId) || null;
      if (request) {
        const newRecord: PaymentRecord = {
          paymentId,
          requestId: request.id,
          amount: request.quoteAmount || 0,
          mode: 0,
          description: `Deposit for ${request.id}`,
          status,
          payerRouting,
          payerName,
          createdAt: new Date().toISOString(),
          paidAt: status === "payment_successful" ? new Date().toISOString() : undefined,
        };
        data.payments.unshift(newRecord);
        payment = newRecord;

        if (status === "payment_successful") {
          request.status = "paid";
        }
        request.updatedAt = new Date().toISOString();
      }
    }

    this.fsSave(data);
    return { payment, request };
  }

  // --- Reviews ---
  async getAllReviews(): Promise<Review[]> {
    if (kvBackendActive()) {
      return (await this.kvLoadReviews()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return this.fsLoad().reviews.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createReview(
    input: Omit<Review, "id" | "createdAt">
  ): Promise<Review> {
    const id = `REV-${Math.random().toString(36).slice(2, 10)}`;
    const review: Review = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
    };

    if (kvBackendActive()) {
      await this.ensureInitialized();
      await this.kv().set(this.revKey(id), JSON.stringify(review));
      await this.kv().lpush(K_REV_LIST, id);
      return review;
    }

    const data = this.fsLoad();
    data.reviews.unshift(review);
    this.fsSave(data);
    return review;
  }

  // --- Maintenance ---
  async resetAllData(): Promise<number> {
    let deleted = 0;
    if (kvBackendActive()) {
      let cursor = "0";
      do {
        const result = await this.kv().scan(cursor, { match: "agency:*", count: 200 });
        const keys = result[1] || [];
        for (const key of keys) {
          await this.kv().del(key);
          deleted++;
        }
        cursor = result[0];
      } while (cursor !== "0");
    } else {
      try {
        if (fs.existsSync(DB_FILE)) {
          fs.writeFileSync(DB_FILE, JSON.stringify({ requests: [], payments: [], reviews: [] }, null, 2), "utf8");
          deleted++;
        }
      } catch (err) {
        console.error("Failed to reset local store:", err);
      }
    }
    return deleted;
  }
}

export const dbStore = new DatabaseStore();