"use client";

import { Home, BookOpen, PenTool, Bell } from "lucide-react";
import React from "react";
import { Magnetik_Medium } from "@/lib/font";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/library", icon: BookOpen, label: "Library" },
    { path: "/pen", icon: PenTool, label: "Pen" },
    { path: "/notification", icon: Bell, label: "Notification" },
  ];

  const isActive = (path: string) => {
    if (path === "/home") return pathname === "/home";
    return pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#f8f7f7] border-t border-[#AFAFAF] w-full sm:max-w-md sm:mx-auto rounded-t-xl z-50 safe-area-bottom">
      <nav
        className="flex items-center justify-around px-1 py-2 sm:py-3 sm:px-2"
        aria-label="Main navigation"
      >
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              href={path}
              prefetch={true}
              className="flex flex-col items-center gap-0.5 sm:gap-1 min-w-0 flex-1 px-1 sm:px-2"
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
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Navbar;
