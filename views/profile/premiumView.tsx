"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { ArrowLeft, Volume2, Download, Bookmark } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";

const PremiumView = () => {
  const [selectedPlan, setSelectedPlan] = useState("6months"); // Default to 6 months

  const plans = [
    {
      id: "1month",
      duration: "One (1)\nMonth",
      price: "₦1,000.00",
      isPopular: false,
    },
    {
      id: "6months",
      duration: "Six (6)\nMonths",
      price: "₦5,000.00",
      isPopular: true,
    },
    {
      id: "1year",
      duration: "One (1)\nYear",
      price: "₦10,000.00",
      isPopular: false,
    },
  ];

  const features = [
    {
      icon: <Volume2 className="w-6 h-6 text-complimentary-colour" />,
      title: "Read with audio",
      description: "Enjoy stories with audio.",
    },
    {
      icon: <Download className="w-6 h-6 text-complimentary-colour" />,
      title: "Download Stories",
      description: "Download stories and read later.",
    },
    {
      icon: <Bookmark className="w-6 h-6 text-complimentary-colour" />,
      title: "Read offline",
      description: "Read stories offline on Storytime.",
    },
  ];

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/home">
            <ArrowLeft className="w-6 h-6 text-primary-colour" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-24 space-y-8">
        {/* Logo and Title */}
        <div className="flex flex-col items-center space-y-4 text-center">
          {/* Storytime Logo */}
          <div className="relative w-24 h-24">
            <Image
              src="/images/logo.png"
              alt="Storytime Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1
            className={`text-xl text-primary-colour ${Magnetik_SemiBold.className}`}
          >
            Storytime Premium
          </h1>
        </div>

        {/* Features */}
        <div className="space-y-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg bg-complimentary-colour/10">
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3
                  className={`text-md text-primary-colour mb-1 ${Magnetik_SemiBold.className}`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-primary-shade-4 text-sm ${Magnetik_Regular.className}`}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                  selectedPlan === plan.id
                    ? "border-complimentary-colour bg-complimentary-colour text-universal-white"
                    : plan.isPopular
                      ? "border-complimentary-colour/30 bg-complimentary-colour/5 text-primary-colour"
                      : "border-light-grey-2 bg-universal-white text-primary-colour"
                } ${
                  plan.isPopular && selectedPlan !== plan.id ? "shadow-md" : ""
                }`}
              >
                <div className="space-y-3 text-center">
                  <div
                    className={`text-[12px] leading-tight ${
                      selectedPlan === plan.id
                        ? "text-universal-white"
                        : "text-primary-shade-4"
                    } ${Magnetik_Regular.className}`}
                  >
                    {plan.duration.split("\n").map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>

                  <div
                    className={`text-md font-bold text-center ${
                      selectedPlan === plan.id
                        ? "text-universal-white"
                        : "text-primary-colour"
                    } ${Magnetik_Bold.className}`}
                  >
                    {plan.price}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-6 text-center">
          <p
            className={`text-primary-colour text-[14px] ${Magnetik_Medium.className}`}
          >
            Upgrade your experience with Storytime today!
          </p>

          <Button
            className={`w-full bg-primary-shade-6 text-universal-white py-4 text-lg ${Magnetik_Medium.className}`}
            size="lg"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumView;
