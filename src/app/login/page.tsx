"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
import { siteConfig } from "../../config/siteConfig";

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#160B36] border border-[#6A0DAD]/40 p-8 rounded-3xl shadow-2xl text-center"
      >
        <div className="w-16 h-16 bg-[#1B0F3D] border border-[#6A0DAD]/40 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#CCFF00]">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-display font-black text-[#F5F3FA] mb-2">Client Login</h1>
        <p className="text-sm text-[#B8AFD1] mb-8">
          Welcome to {siteConfig.agencyName}. Sign in with your Discord account (linked to your GTAW UCP) to submit briefs and securely access deliverables.
        </p>

        <button
          onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
          className="w-full py-3.5 px-6 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold transition-colors flex items-center justify-center gap-3"
        >
          <Sparkles className="w-5 h-5" />
          Sign in with Discord
        </button>
      </motion.div>
    </div>
  );
}
