import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { DesignRequest, PaymentRecord } from "../types";

interface DatabaseSchema {
  requests: DesignRequest[];
  payments: PaymentRecord[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "agency.json");

const LEGACY_KEY = "agency:db";
const K_REQ_LIST = "agency:reqs";
const K_PAY_LIST = "agency:pays";
const K_INIT = "agency:init";

const SEED_REQUESTS: DesignRequest[] = [
  {
    id: "REQ-1042",
    clientName: "Anthony 'Tony' Carlucci",
    discordTag: "tony_carlucci#0001",
    businessName: "Carlucci's Ristorante & Pizzeria",
    projectType: "Menu & Print Collateral",
    budgetRange: "$15,000 - $25,000",
    urgency: "standard",
    brief:
      "We need an authentic Little Italy dinner & wine menu for our grand opening on Alta Street. Looking for a deep burgundy, gold foil, and cream aesthetic. Needs 4 pages: Antipasti, Pasta, Mains, and Italian Wine Cellar.",
    status: "paid",
    quoteAmount: 20000,
    quoteNotes: "4-page leather bound texture menu + forum BBCode menu card.",
    fleecaPaymentId: "flc_seed_1042",
    fleecaPaymentLink: "/payment/result?payment_id=flc_seed_1042",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "REQ-1043",
    clientName: "Sgt. Michael Ross",
    discordTag: "mross_lssd#4412",
    businessName: "San Andreas Highway Patrol Motorsports",
    projectType: "Menu & Print Collateral",
    budgetRange: "$40,000 - $60,000",
    urgency: "priority",
    brief:
      "Custom high-visibility interceptor livery for our community outreach Bravado Buffalo STX and Vapid Dominator GT. Incorporate reflective chevron striping, SAHP star badge, and motto.",
    status: "quoted",
    quoteAmount: 45000,
    quoteNotes: "Full multi-model livery pack with 4K template layers and .ytd configuration.",
    fleecaPaymentId: "flc_seed_1043",
    fleecaPaymentLink: "/fleeca-mock/checkout/flc_seed_1043?amount=45000&req=REQ-1043",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: "REQ-1044",
    clientName: "Chloe Davenport",
    discordTag: "chloedavenport#9920",
    businessName: "Lust & Luxe Nightclub",
    projectType: "Brand Kit",
    budgetRange: "$30,000 - $50,000",
    urgency: "rush",
    brief:
      "Full rebrand of our Vinewood nightlife lounge. Looking for neon magenta, dark violet, and cyber-luxe aesthetics. We need club logo, VIP wristbands, drink menu, and Facebrowser promotional flyers.",
    status: "pending_quote",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

const SEED_PAYMENTS: PaymentRecord[] = [
  {
    paymentId: "flc_seed_1042",
    requestId: "REQ-1042",
    amount: 20000,
    mode: 0,
    description: "Design deposit — Request #REQ-1042 (Carlucci's Menu)",
    status: "payment_successful",
    payerRouting: "020098144",
    payerName: "Anthony Carlucci",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    paidAt: new Date(Date.now() - 2 * 86400000 + 45000).toISOString(),
  },
];

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

  private async ensureSeeded(): Promise<void> {
    if ((await this.kv().setnx(K_INIT, "1")) !== 1) return;

    let requests = SEED_REQUESTS;
    let payments = SEED_PAYMENTS;
    try {
      const legacy = await this.kv().get<string>(LEGACY_KEY);
      if (legacy) {
        const data = JSON.parse(legacy) as DatabaseSchema;
        requests = data.requests && data.requests.length ? data.requests : SEED_REQUESTS;
        payments = data.payments && data.payments.length ? data.payments : SEED_PAYMENTS;
      }
    } catch {
      console.error("Failed to migrate legacy KV doc, using seeds.");
    }

    for (const req of requests) {
      await this.kv().set(this.reqKey(req.id), JSON.stringify(req));
      await this.kv().lpush(K_REQ_LIST, req.id);
    }
    for (const pay of payments) {
      await this.kv().set(this.payKey(pay.paymentId), JSON.stringify(pay));
      await this.kv().lpush(K_PAY_LIST, pay.paymentId);
    }
    await this.kv().del(LEGACY_KEY);
  }

  private async kvLoadRequests(): Promise<DesignRequest[]> {
    await this.ensureSeeded();
    const ids = await this.kv().lrange<string>(K_REQ_LIST, 0, -1);
    if (!ids) return [];
    const seen = new Set<string>();
    const out: DesignRequest[] = [];
    for (const id of ids) {
      if (seen.has(id)) continue;
      seen.add(id);
      const raw = await this.kv().get<string>(this.reqKey(id));
      if (!raw) continue;
      try {
        out.push(JSON.parse(raw) as DesignRequest);
      } catch {
        /* skip corrupt item */
      }
    }
    return out;
  }

  private async kvLoadPayments(): Promise<PaymentRecord[]> {
    await this.ensureSeeded();
    const ids = await this.kv().lrange<string>(K_PAY_LIST, 0, -1);
    if (!ids) return [];
    const seen = new Set<string>();
    const out: PaymentRecord[] = [];
    for (const id of ids) {
      if (seen.has(id)) continue;
      seen.add(id);
      const raw = await this.kv().get<string>(this.payKey(id));
      if (!raw) continue;
      try {
        out.push(JSON.parse(raw) as PaymentRecord);
      } catch {
        /* skip corrupt item */
      }
    }
    return out;
  }

  private fsLoad(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(DB_FILE)) {
        const initialData: DatabaseSchema = {
          requests: SEED_REQUESTS,
          payments: SEED_PAYMENTS,
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
        return initialData;
      }
      const raw = fs.readFileSync(DB_FILE, "utf8");
      return JSON.parse(raw) as DatabaseSchema;
    } catch (err) {
      console.error("Failed to read store:", err);
      return { requests: SEED_REQUESTS, payments: SEED_PAYMENTS };
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
      await this.ensureSeeded();
      const raw = await this.kv().get<string>(this.reqKey(id));
      if (!raw) return null;
      try {
        return JSON.parse(raw) as DesignRequest;
      } catch {
        return null;
      }
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
      await this.ensureSeeded();
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
      await this.ensureSeeded();
      const raw = await this.kv().get<string>(this.payKey(paymentId));
      if (!raw) return null;
      try {
        return JSON.parse(raw) as PaymentRecord;
      } catch {
        return null;
      }
    }
    return this.fsLoad().payments.find((p) => p.paymentId === paymentId) || null;
  }

  async getPaymentByRequestId(requestId: string): Promise<PaymentRecord | null> {
    const payments = kvBackendActive() ? await this.kvLoadPayments() : this.fsLoad().payments;
    return payments.find((p) => p.requestId === requestId) || null;
  }

  async savePayment(record: PaymentRecord): Promise<PaymentRecord> {
    if (kvBackendActive()) {
      await this.ensureSeeded();
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
      await this.ensureSeeded();
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
}

export const dbStore = new DatabaseStore();