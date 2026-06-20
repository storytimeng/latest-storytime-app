"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Check, Crown, Sparkles } from "lucide-react";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import {
  PREMIUM_UPSELL_CONTENT,
  type PremiumUpsellReason,
} from "@/src/lib/premiumUpsell";

interface PremiumUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: PremiumUpsellReason | null;
}

export const PremiumUpsellModal: React.FC<PremiumUpsellModalProps> = ({
  isOpen,
  onClose,
  reason,
}) => {
  const router = useRouter();
  const content = reason ? PREMIUM_UPSELL_CONTENT[reason] : null;

  const handleUpgrade = () => {
    onClose();
    router.push("/premium");
  };

  return (
    <Modal
      isOpen={isOpen && Boolean(content)}
      onClose={onClose}
      placement="center"
      classNames={{
        base: "mx-4 max-w-md",
        body: "py-4",
      }}
    >
      <ModalContent>
        {content ? (
          <>
            <ModalHeader className="flex flex-col items-center gap-3 pb-0">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#FFEBD0]">
                <Crown className="w-7 h-7 text-complimentary-colour" />
              </div>
              <h2
                className={`text-lg text-center text-primary-colour ${Magnetik_Bold.className}`}
              >
                {content.title}
              </h2>
            </ModalHeader>

            <ModalBody>
              <p
                className={`text-sm text-center text-primary-shade-4 leading-relaxed ${Magnetik_Regular.className}`}
              >
                {content.description}
              </p>

              <ul className="mt-4 space-y-2.5">
                {content.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2.5 text-sm text-primary-shade-5"
                  >
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-complimentary-colour" />
                    <span className={Magnetik_Regular.className}>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-complimentary-colour">
                <Sparkles className="w-3.5 h-3.5" />
                <span className={Magnetik_Medium.className}>
                  Join thousands of Premium readers on Storytime
                </span>
              </div>
            </ModalBody>

            <ModalFooter className="flex flex-col gap-2 pt-0">
              <Button
                className="w-full bg-complimentary-colour text-white font-semibold"
                onPress={handleUpgrade}
              >
                View Premium plans
              </Button>
              <Button
                variant="light"
                className="w-full text-primary-shade-4"
                onPress={onClose}
              >
                Maybe later
              </Button>
            </ModalFooter>
          </>
        ) : null}
      </ModalContent>
    </Modal>
  );
};
