"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Camera, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { Skeleton } from "@heroui/skeleton";

interface ProfileCardProps {
  name?: string;
  username?: string;
  profileImage?: string;
  showSettings?: boolean;
  className?: string;
  containerClassName?: string;
  textClassName?: string;
  useLiveData?: boolean; // If true, fetch from API
}

const ProfileCard = ({
  name,
  username,
  profileImage,
  showSettings = false,
  className = "",
  containerClassName = "",
  textClassName = "",
  useLiveData = false,
}: ProfileCardProps) => {
  const router = useRouter();
  const { user, isLoading } = useUserProfile();

  React.useEffect(() => {
    router.prefetch("/settings");
  }, [router]);

  // Use live data from API if enabled
  const displayName = useLiveData && user 
    ?  `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"
    : name || "Reader";
  
  const displayUsername = useLiveData && user
    ? user.penName ? `@${user.penName}` : user.email
    : username || "@Anonymous";
  
  const displayImage = useLiveData && user
    ? user.profilePicture || user.avatar || "/person-with-sunglasses-smiling.jpg"
    : profileImage || "/person-with-sunglasses-smiling.jpg";

  if (useLiveData && isLoading) {
    return (
      <div className={`bg-primary-colour px-5 pb-6 mt-[10px] ${containerClassName}`}>
        <div className={`flex items-center justify-between h-[60px] ${className}`}>
          <div className="flex items-center gap-4">
            <Skeleton className="w-[60px] h-[60px] rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-24 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
          </div>
          {showSettings && <Skeleton className="w-10 h-10 rounded" />}
        </div>
      </div>
    );
  }
  return (
    <div
      className={`bg-primary-colour px-5 pb-6 mt-[10px] ${containerClassName}`}
    >
      <div
        className={`flex items-center justify-between h-[60px] ${className}`}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-4 border-complimentary-colour">
              <Image
                src={displayImage}
                alt="Profile"
                width={60}
                height={60}
                className="object-cover w-full h-full"
                
              />
            </div>
            <button 
              className="absolute flex items-center justify-center w-8 h-8 rounded-full -bottom-1 -right-1 bg-universal-white cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => router.push("?modal=edit-profile", { scroll: false })}
            >
              <Camera className="w-4 h-4 text-primary-colour" />
            </button>
          </div>
          <div
            className={cn(
              "text-universal-white gap-y-[4px] flex items-center flex-col text-left cursor-pointer hover:opacity-80 transition-opacity",
              textClassName
            )}
            onClick={() => router.push("?modal=edit-profile", { scroll: false })}
          >
            <h2 className="body-text-big-bold-auto">{displayName}</h2>
            <p className="body-text-small-medium-auto">{displayUsername}</p>
          </div>
        </div>

        {showSettings && (
          <Link href="/settings">
            <Button isIconOnly variant="ghost" className="text-universal-white">
              <Settings size={24} />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
