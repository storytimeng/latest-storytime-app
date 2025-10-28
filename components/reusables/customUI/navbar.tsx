"use client";

import { Button } from "@/components/ui/button";
import { Home, BookOpen, PenTool, Bell } from "lucide-react";
import React from "react";
import { Magnetik_Medium } from "@/lib/font";
import { useRouter, usePathname } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/app") return pathname === "/app";
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f8f7f7] border-t border-[#AFAFAF] max-w-sm mx-auto rounded-t-xl z-50">
        <div className="flex items-center justify-around py-3 px-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 min-w-0 flex-1"
            onPress={() => router.push("/app")}
          >
            <Home className={`w-5 h-5 ${isActive("/app") ? "fill-[#361B17]" : "text-[#361B17]"}`} />
            <span className={`text-xs ${Magnetik_Medium.className} ${isActive("/app") ? "text-primary-colour" : "text-[#361B17]"}`}>
              Home
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 min-w-0 flex-1"
            onPress={() => router.push("/app/library")}
          >
            <BookOpen className="w-5 h-5 text-[#361B17]" />
            <span className={`text-xs ${Magnetik_Medium.className} ${isActive("/app/library") ? "text-primary-colour" : "text-[#361B17]"}`}>
              Library
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 min-w-0 flex-1"
            onPress={() => router.push("/app/pen")}
          >
            <PenTool className="w-5 h-5 text-[#361B17]" />
            <span className={`text-xs ${Magnetik_Medium.className} ${isActive("/app/pen") ? "text-primary-colour" : "text-[#361B17]"}`}>
              Pen
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 min-w-0 flex-1"
            onPress={() => router.push("/app/notification")}
          >
            <Bell className="w-5 h-5 text-[#361B17]" />
            <span className={`text-xs ${Magnetik_Medium.className} ${isActive("/app/notification") ? "text-primary-colour" : "text-[#361B17]"}`}>
              Notification
            </span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
