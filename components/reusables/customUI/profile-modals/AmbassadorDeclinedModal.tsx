"use client";

import { ModalHeader, ModalBody, useModalContext } from "@heroui/modal";
import { Button } from "@heroui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { cn } from "@/lib";
import { useAmbassadorOverview } from "@/src/hooks/useAmbassador";
import { useAmbassadorRoutes } from "@/components/ambassador/AmbassadorRoutesProvider";

export const AmbassadorDeclinedModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { onClose } = useModalContext();
  const { overview } = useAmbassadorOverview();
  const routes = useAmbassadorRoutes();

  const application = overview?.application;
  const reapplyDays = application?.reapplyDaysRemaining ?? 0;
  const canReapply = application?.canReapply ?? false;

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    router.push(`?${params.toString()}`, { scroll: false });
    onClose?.();
  };

  const handleViewDetails = () => {
    closeModal();
    router.push(routes.declined);
  };

  return (
    <>
      <ModalHeader className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-grey-5">
        <button
          type="button"
          onClick={closeModal}
          className="text-primary-colour p-1"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={closeModal}
          className="text-primary-colour p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </ModalHeader>

      <ModalBody className="px-6 py-8 pb-10 text-center">
        <h2
          className={cn(
            Magnetik_Bold.className,
            "text-3xl text-red leading-tight",
          )}
        >
          Declined!!
        </h2>
        <p className={cn(Magnetik_Regular.className, "text-sm text-red mt-2")}>
          {canReapply
            ? "You can reapply now"
            : `Reapply in ${reapplyDays} day${reapplyDays === 1 ? "" : "s"}`}
        </p>

        <div className="flex gap-3 mt-8">
          <Button
            variant="bordered"
            className={cn(
              "flex-1 h-12 rounded-full border-primary-colour text-primary-colour bg-white",
              Magnetik_Medium.className,
            )}
            onPress={closeModal}
          >
            Cancel
          </Button>
          <Button
            className={cn(
              "flex-1 h-12 rounded-full bg-primary-colour text-white",
              Magnetik_Medium.className,
            )}
            onPress={handleViewDetails}
          >
            View Details
          </Button>
        </div>
      </ModalBody>
    </>
  );
};
