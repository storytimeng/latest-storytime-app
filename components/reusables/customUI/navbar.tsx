"use client";

import { Button } from "@heroui/button";
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

  const navItems = [
    { path: "/app", icon: Home, label: "Home" },
    { path: "/library", icon: BookOpen, label: "Library" },
    { path: "/pen", icon: PenTool, label: "Pen" },
    { path: "/notification", icon: Bell, label: "Notification" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#f8f7f7] border-t border-[#AFAFAF] w-full sm:max-w-md sm:mx-auto rounded-t-xl z-50 safe-area-bottom">
      <nav
        className="flex items-center justify-around px-1 py-2 sm:py-3 sm:px-2"
        aria-label="Main navigation"
      >
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);
          return (
            <Button
              key={path}
              variant="ghost"
              size="sm"
              className="flex flex-col items-center border-0 gap-0.5 sm:gap-1 min-w-0 flex-1 px-1 sm:px-2"
              onPress={() => router.push(path)}
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                  active ? "fill-[#361B17]" : "text-[#361B17]"
                }`}
              />
              <span
                className={`text-[10px] sm:text-xs ${
                  Magnetik_Medium.className
                } transition-colors truncate max-w-full ${
                  active
                    ? "text-primary-colour font-semibold"
                    : "text-[#361B17]"
                }`}
              >
                {label}
              </span>
            </Button>
          );
        })}
      </nav>
    </div>
  );
};

export default Navbar;
