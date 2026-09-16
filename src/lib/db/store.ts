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
const KV_KEY = "agency:db";

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

  private async load(): Promise<DatabaseSchema> {
    if (kvBackendActive()) {
      const raw = await this.kv().get<string>(KV_KEY);
      if (raw) {
        try {
          return JSON.parse(raw) as DatabaseSchema;
        } catch {
          console.error("Failed to parse KV store, reseeding.");
        }
      }
      const seeded: DatabaseSchema = { requests: SEED_REQUESTS, payments: SEED_PAYMENTS };
      await this.kv().setnx(KV_KEY, JSON.stringify(seeded));
      const next = await this.kv().get<string>(KV_KEY);
      if (next) {
        try {
          return JSON.parse(next) as DatabaseSchema;
        } catch {
          return seeded;
        }
      }
      return seeded;
    }

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

  private async save(data: DatabaseSchema): Promise<void> {
    if (kvBackendActive()) {
      await this.kv().set(KV_KEY, JSON.stringify(data));
      return;
    }

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
    const data = await this.load();
    return data.requests.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getRequestById(id: string): Promise<DesignRequest | null> {
    const data = await this.load();
    return data.requests.find((r) => r.id === id) || null;
  }

  async createRequest(
    input: Omit<DesignRequest, "id" | "status" | "createdAt" | "updatedAt">
  ): Promise<DesignRequest> {
    const data = await this.load();
    const id = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newReq: DesignRequest = {
      ...input,
      id,
      status: "pending_quote",
      createdAt: now,
      updatedAt: now,
    };

    data.requests.unshift(newReq);
    await this.save(data);
    return newReq;
  }

  async updateRequest(id: string, updates: Partial<DesignRequest>): Promise<DesignRequest | null> {
    const data = await this.load();
    const index = data.requests.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updated = {
      ...data.requests[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    data.requests[index] = updated;
    await this.save(data);
    return updated;
  }

  // --- Payments ---
  async getAllPayments(): Promise<PaymentRecord[]> {
    const data = await this.load();
    return data.payments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPaymentById(paymentId: string): Promise<PaymentRecord | null> {
    const data = await this.load();
    return data.payments.find((p) => p.paymentId === paymentId) || null;
  }

  async getPaymentByRequestId(requestId: string): Promise<PaymentRecord | null> {
    const data = await this.load();
    return data.payments.find((p) => p.requestId === requestId) || null;
  }

  async savePayment(record: PaymentRecord): Promise<PaymentRecord> {
    const data = await this.load();
    const existingIndex = data.payments.findIndex((p) => p.paymentId === record.paymentId);
    if (existingIndex >= 0) {
      data.payments[existingIndex] = record;
    } else {
      data.payments.unshift(record);
    }
    await this.save(data);
    return record;
  }

  async reconcilePayment(
    paymentId: string,
    status: "payment_successful" | "payment_failed" | "pending",
    payerRouting?: string,
    payerName?: string
  ): Promise<{ payment: PaymentRecord | null; request: DesignRequest | null }> {
    const data = await this.load();
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

    await this.save(data);
    return { payment, request };
  }
}

export const dbStore = new DatabaseStore();