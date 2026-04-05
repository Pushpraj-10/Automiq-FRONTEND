"use client";

import React from "react";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { createCheckout } from "@/state/slices/billing.slice";

export default function BillingPage() {
  const dispatch = useAppDispatch();
  const billingStatus = useAppSelector((s) => s.billing.status);

  const handleUpgrade = async (priceId: string) => {
    try {
      const result = await dispatch(createCheckout(priceId)).unwrap();
      window.location.href = result.checkoutUrl;
    } catch {
      // Error is in Redux state
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0e0e0e]/90 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FACC15]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-extrabold tracking-[-0.4px] flex items-center gap-2 text-white">
                <CreditCard className="w-5 h-5 text-yellow-400" /> Current Plan: Pro Trial
              </CardTitle>
              <CardDescription className="text-[#a0a0a0] font-medium">
                Your trial expires in 12 days. Upgrade to retain access to premium features.
              </CardDescription>
            </div>
            <div className="bg-[#FACC15]/10 border border-yellow-400/20 text-yellow-300 px-3 py-1 text-xs font-extrabold rounded-full uppercase tracking-wider">
              Trialing
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-black/20 rounded-xl p-4 border border-white/10">
              <div className="text-3xl font-black text-white mb-1">2,341 <span className="text-sm font-normal text-neutral-500">/ 5,000</span></div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Tasks Executed (Month)</div>
            </div>
            <div className="bg-black/20 rounded-xl p-4 border border-white/10">
              <div className="text-3xl font-black text-white mb-1">12 <span className="text-sm font-normal text-neutral-500">/ Unlimited</span></div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Active Workflows</div>
            </div>
            <div className="bg-black/20 rounded-xl p-4 border border-white/10 sm:col-span-2 lg:col-span-1">
              <div className="text-3xl font-black text-white mb-1">99.4%</div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Execution Success</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-white/5 pt-6">
          <Button
            variant="outline"
            className="h-11 rounded-xl border-white/15 bg-transparent px-5 text-neutral-200 font-semibold tracking-[0.1px] transition-all duration-200 hover:bg-white/8 hover:border-white/25 hover:text-white active:translate-y-0"
          >
            Manage Subscription
          </Button>
          <Button
            onClick={() => handleUpgrade("price_pro")}
            disabled={billingStatus === "loading"}
            className="h-11 rounded-xl bg-[#FACC15] px-5 text-black font-extrabold tracking-[0.1px] shadow-[0_12px_28px_rgba(250,204,21,0.22)] transition-all duration-200 hover:bg-[#ffe066] hover:shadow-[0_16px_32px_rgba(250,204,21,0.3)] disabled:bg-[#FACC15]/80 disabled:text-black/70 disabled:opacity-100 active:translate-y-0"
          >
            {billingStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Upgrade to Pro
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-[#0e0e0e]/90 border-white/5 text-white rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Free Plan</CardTitle>
            <div className="text-3xl font-black mt-2">$0 <span className="text-sm font-normal text-neutral-500">/mo</span></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {[
                "1,000 Tasks per month",
                "5 Active Workflows",
                "Standard Integrations",
                "Community Support"
              ].map((feature, i) => (
                <li key={i} className="flex items-center text-sm text-neutral-300 font-medium">
                  <Check className="w-4 h-4 mr-3 text-neutral-500" /> {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="h-11 w-full rounded-xl border-white/15 bg-transparent text-neutral-300 font-semibold transition-all duration-200 hover:bg-white/8 hover:border-white/25 hover:text-white active:translate-y-0"
            >
              Downgrade
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-[#0e0e0e]/90 border-yellow-400/30 text-white relative rounded-2xl shadow-[0_12px_36px_rgba(250,204,21,0.08)]">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Pro Plan</CardTitle>
            <div className="text-3xl font-black mt-2">$29 <span className="text-sm font-normal text-neutral-500">/mo</span></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {[
                "10,000 Tasks per month",
                "Unlimited Workflows",
                "Premium Integrations",
                "Priority Email Support",
                "1 min polling interval"
              ].map((feature, i) => (
                <li key={i} className="flex items-center text-sm text-neutral-200 font-medium">
                  <Check className="w-4 h-4 mr-3 text-yellow-400" /> {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="h-11 w-full rounded-xl bg-[#FACC15] text-black font-extrabold tracking-[0.1px] shadow-[0_10px_24px_rgba(250,204,21,0.22)] transition-all duration-200 hover:bg-[#ffe066] hover:shadow-[0_14px_30px_rgba(250,204,21,0.3)] active:translate-y-0">
              Current Plan
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
