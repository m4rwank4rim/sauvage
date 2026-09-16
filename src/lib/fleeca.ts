import crypto from "crypto";

export interface FleecaBalanceResponse {
  success: boolean;
  data?: {
    account_name: string;
    routing_number: string;
    balance: number;
  };
  error?: string;
}

export interface CreatePaymentParams {
  amount: number; // 1 - 99,999,999
  mode?: 0 | 1; // 0 = sandbox, 1 = live
  description?: string;
  requestId?: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  payment_id?: string;
  payment_link?: string;
  message?: string;
  isSimulated?: boolean;
}

export interface FleecaPaymentDetail {
  payment_id: string;
  payment_url: string;
  mode: string | number;
  amount: number;
  payer_routing?: string;
  payer_name?: string;
  status: "payment_successful" | "payment_failed" | "pending";
  description?: string;
  created_at: string;
  paid_at?: string;
}

export class FleecaClient {
  private apiKey: string;
  private baseUrl: string;
  private defaultMode: 0 | 1;

  constructor() {
    this.apiKey = process.env.FLEECA_API_KEY || "sandbox_secret_key_demo";
    this.baseUrl = (process.env.FLEECA_BASE_URL || "https://banking.gta.world").replace(/\/+$/, "");
    this.defaultMode = process.env.FLEECA_MODE === "1" ? 1 : 0;
  }

  private isSandboxDemoKey(): boolean {
    return (
      !this.apiKey ||
      this.apiKey === "sandbox_secret_key_demo" ||
      this.apiKey.startsWith("demo_") ||
      this.apiKey.startsWith("sandbox_")
    );
  }

  /**
   * Check merchant account balance
   * GET /api/v2/balance
   */
  async getBalance(): Promise<FleecaBalanceResponse> {
    if (this.isSandboxDemoKey()) {
      return {
        success: true,
        data: {
          account_name: "Vortex Creative Studios LLC",
          routing_number: "020084912",
          balance: 842500,
        },
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/v2/balance`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return {
          success: false,
          error: errJson.message || `Fleeca API returned HTTP ${res.status}`,
        };
      }

      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error contacting Fleeca Gateway";
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Create a payment link
   * POST /api/v2/payment
   */
  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResponse> {
    const { amount, description = "Design Deposit", mode = this.defaultMode, requestId } = params;

    // Validate amount bounds per spec: 1 to 99,999,999
    if (amount < 1 || amount > 99999999 || !Number.isInteger(amount)) {
      throw new Error("Invalid payment amount: must be an integer between $1 and $99,999,999.");
    }

    // Truncate description to 255 characters max
    const sanitizedDescription = description.slice(0, 255);

    // If sandbox demo key, return instant simulated gateway session
    if (this.isSandboxDemoKey()) {
      const simPaymentId = `flc_sim_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const paymentLink = `${siteUrl}/fleeca-mock/checkout/${simPaymentId}?amount=${amount}&desc=${encodeURIComponent(
        sanitizedDescription
      )}${requestId ? `&req=${requestId}` : ""}`;

      return {
        success: true,
        payment_id: simPaymentId,
        payment_link: paymentLink,
        message: "Simulated sandbox payment link generated.",
        isSimulated: true,
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/v2/payment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          amount,
          mode,
          description: sanitizedDescription,
        }),
      });

      if (res.status === 401) {
        throw new Error("Fleeca API authentication failed (401). Please verify FLEECA_API_KEY.");
      }
      if (res.status === 422) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Fleeca validation error (422): ${JSON.stringify(errorData)}`);
      }
      if (res.status === 429) {
        throw new Error("Fleeca rate limit exceeded (10 requests/minute max). Please wait a moment.");
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Fleeca API error (${res.status}): ${errorText}`);
      }

      const json = await res.json();
      return {
        success: Boolean(json.success),
        payment_id: json.payment_id,
        payment_link: json.payment_link,
        message: json.message,
        isSimulated: false,
      };
    } catch (err: unknown) {
      if (mode === 1) {
        throw err;
      }
      
      // In case the live API server cannot be reached during local dev, fallback gracefully to simulation
      console.warn("Real Fleeca API call failed, generating fallback sandbox link:", err);
      const fallbackId = `flc_dev_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      return {
        success: true,
        payment_id: fallbackId,
        payment_link: `${siteUrl}/fleeca-mock/checkout/${fallbackId}?amount=${amount}&desc=${encodeURIComponent(
          sanitizedDescription
        )}${requestId ? `&req=${requestId}` : ""}`,
        message: "Fallback simulated link (gateway offline or sandbox mode).",
        isSimulated: true,
      };
    }
  }

  /**
   * Retrieve payment status
   * GET /api/v2/payments/{payment_id}
   */
  async getPayment(paymentId: string): Promise<FleecaPaymentDetail | null> {
    if (this.isSandboxDemoKey() || paymentId.startsWith("flc_sim_") || paymentId.startsWith("flc_dev_")) {
      return null;
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/v2/payments/${paymentId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) return null;
      const json = await res.json();
      return json.data || json;
    } catch {
      return null;
    }
  }

  /**
   * Verify HMAC-SHA256 signature on incoming webhooks
   * Header: X-Fleeca-Signature: sha256=<hex>
   */
  verifyWebhookSignature(rawBody: string | Buffer, signatureHeader: string | null): boolean {
    if (!signatureHeader) return false;

    // Expected format: "sha256=<hex>" or raw "<hex>"
    const parts = signatureHeader.split("=");
    const providedHex = parts.length === 2 ? parts[1].trim() : parts[0].trim();

    if (!providedHex) return false;

    const hmac = crypto.createHmac("sha256", this.apiKey);
    hmac.update(rawBody);
    const calculatedHex = hmac.digest("hex");

    try {
      const bufCalculated = Buffer.from(calculatedHex, "hex");
      const bufProvided = Buffer.from(providedHex, "hex");

      if (bufCalculated.length !== bufProvided.length) {
        return false;
      }

      return crypto.timingSafeEqual(bufCalculated, bufProvided);
    } catch {
      return false;
    }
  }

  /**
   * Helper to generate a valid signature for simulated webhooks in sandbox mode
   */
  signPayload(rawBody: string): string {
    const hmac = crypto.createHmac("sha256", this.apiKey);
    hmac.update(rawBody);
    return `sha256=${hmac.digest("hex")}`;
  }
}

export const fleecaClient = new FleecaClient();
