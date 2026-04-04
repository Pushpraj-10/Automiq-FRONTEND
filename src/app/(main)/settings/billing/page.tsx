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
    <div className="space-y-6">
      <Card className="bg-indigo-950/20 border-indigo-900/50 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl flex items-center gap-2 text-indigo-100">
                <CreditCard className="w-5 h-5 text-indigo-400" /> Current Plan: Pro Trial
              </CardTitle>
              <CardDescription className="text-indigo-200/60">
                Your trial expires in 12 days. Upgrade to retain access to premium features.
              </CardDescription>
            </div>
            <div className="bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider">
              Trialing
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-lg p-4 border border-indigo-900/30">
              <div className="text-3xl font-bold text-white mb-1">2,341 <span className="text-sm font-normal text-indigo-200/60">/ 5,000</span></div>
              <div className="text-xs uppercase tracking-wider text-indigo-300">Tasks Executed (Month)</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4 border border-indigo-900/30">
              <div className="text-3xl font-bold text-white mb-1">12 <span className="text-sm font-normal text-indigo-200/60">/ Unlimited</span></div>
              <div className="text-xs uppercase tracking-wider text-indigo-300">Active Workflows</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t border-indigo-900/30 pt-6">
          <Button variant="outline" className="border-indigo-800 bg-transparent text-indigo-300 hover:bg-indigo-900/50">
            Manage Subscription
          </Button>
          <Button
            onClick={() => handleUpgrade("price_pro")}
            disabled={billingStatus === "loading"}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20"
          >
            {billingStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Upgrade to Pro
          </Button>
        </CardFooter>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-neutral-900 border-neutral-800 text-white">
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <div className="text-3xl font-bold mt-2">$0 <span className="text-sm font-normal text-neutral-500">/mo</span></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {[
                "1,000 Tasks per month",
                "5 Active Workflows",
                "Standard Integrations",
                "Community Support"
              ].map((feature, i) => (
                <li key={i} className="flex items-center text-sm text-neutral-300">
                  <Check className="w-4 h-4 mr-3 text-neutral-500" /> {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-neutral-700 bg-neutral-800 text-neutral-300">Downgrade</Button>
          </CardFooter>
        </Card>

        <Card className="bg-neutral-900 border-indigo-500/50 text-white relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            MOST POPULAR
          </div>
          <CardHeader>
            <CardTitle>Pro Plan</CardTitle>
            <div className="text-3xl font-bold mt-2">$29 <span className="text-sm font-normal text-neutral-500">/mo</span></div>
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
                <li key={i} className="flex items-center text-sm text-neutral-200">
                  <Check className="w-4 h-4 mr-3 text-indigo-400" /> {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-white text-black hover:bg-neutral-200">Current Plan</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
