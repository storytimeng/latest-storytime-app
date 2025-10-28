"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function EmailSentView() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-primary-colour mt-16 flex flex-col justify-center items-center mb-10">
        <Image
          src="/images/Email.png"
          alt="Email Sent"
          width={150}
          height={150}
        />
        <div className="flex flex-col mt-8 gap-3 text-center justify-center items-center">
          <div className="text-primary-color body-text-big-medium-auto">
            Email sent!
          </div>
          <div className="body-text-small-regular-auto text-grey-2 px-4 max-w-sm">
            Kindly follow the steps provided in the email sent to your email
            address to update your password. You can also choose to Login if you
            don&apos;t want to change password at this time.
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-auto mb-6">
        <Button variant="large" onPress={handleLogin}>
          Log in
        </Button>
      </div>
    </div>
  );
}
