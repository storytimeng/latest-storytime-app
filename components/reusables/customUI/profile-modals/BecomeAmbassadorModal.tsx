"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { Magnetik_Medium, Magnetik_SemiBold } from "@/lib/font";

const perks = [
  "Earn impact scores and climb ambassador tiers",
  "Get a unique referral link to grow Storytime",
  "Represent Storytime on campus or in your community",
  "Submit monthly reports and track your progress",
];

export const BecomeAmbassadorModal = () => {
  const router = useRouter();

  return (
    <>
      <ModalHeader className="flex flex-col gap-1 border-b border-grey-5">
        <span className={`${Magnetik_SemiBold.className} text-primary-colour`}>
          Become an Ambassador
        </span>
        <span className="text-sm text-grey-2 font-normal">
          Join our ambassador program
        </span>
      </ModalHeader>
      <ModalBody className="py-6">
        <div className="text-center mb-4">
          <span className="text-4xl">🌟</span>
        </div>
        <ul className="space-y-2 mb-6">
          {perks.map((perk) => (
            <li
              key={perk}
              className={`${Magnetik_Medium.className} text-sm text-primary-colour flex gap-2`}
            >
              <span>✓</span>
              <span>{perk}</span>
            </li>
          ))}
        </ul>
        <Button
          className="w-full bg-primary-colour text-white"
          onPress={() => router.push("/ambassador")}
        >
          Learn More & Apply
        </Button>
      </ModalBody>
    </>
  );
};
