"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Camera, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib";

interface ProfileCardProps {
  name?: string;
  username?: string;
  profileImage?: string;
  showSettings?: boolean;
  className?: string;
  containerClassName?: string;
  textClassName?: string;
}

const ProfileCard = ({
  name = "Ruby Ruby",
  username = "@Rubystar",
  profileImage = "/person-with-sunglasses-smiling.jpg",
  showSettings = false,
  className = "",
  containerClassName = "",
  textClassName = "",
}: ProfileCardProps) => {
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
                src={profileImage}
                alt="Profile"
                width={60}
                height={60}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="absolute flex items-center justify-center w-8 h-8 rounded-full -bottom-1 -right-1 bg-universal-white">
              <Camera className="w-4 h-4 text-primary-colour" />
            </div>
          </div>
          <div
            className={cn(
              "text-universal-white gap-y-[4px] flex items-center flex-col text-left",
              textClassName
            )}
          >
            <h2 className="body-text-big-bold-auto">{name}</h2>
            <p className="body-text-small-medium-auto">{username}</p>
          </div>
        </div>

        {showSettings && (
          <Link href="/app/settings">
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
