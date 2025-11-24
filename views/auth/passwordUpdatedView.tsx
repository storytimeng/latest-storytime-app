"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function PasswordUpdatedView() {
  const router = useRouter();

  const handleProceed = () => {
    router.push("/auth/login");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col justify-center items-center flex-1">
        <div className="flex  justify-center pl-20">
          <Image
            src="/images/celebrate.gif"
            alt="Success"
            width={150}
            height={150}
          />
        </div>

        <div className="flex flex-col gap-3 text-center justify-center items-center mt-6">
          <div className="text-primary-colour body-text-big-bold-auto">
            Successful!
          </div>
          <div
            className="body-text-big-regular text-grey-2 px-4 max-w-sm"
            style={{ lineHeight: "26px", marginTop: "12px" }}
          >
            You have successfully created a new password
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Button variant="large" onPress={handleProceed}>
          Proceed
        </Button>
      </div>
    </div>
  );
}
