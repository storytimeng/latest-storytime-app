"use client";

import { Home, BookOpen, PenTool, Bell } from "lucide-react";
import React from "react";
import { Magnetik_Medium, Magnetik_Bold } from "@/lib/font";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useNotifications } from "@/src/hooks/useNotifications";
import { useAuthStore } from "@/src/stores/useAuthStore";

const Navbar = () => {
  const pathname = usePathname();
  const isLoggedIn = useAuthStore((s) => !!s.token);
  const { unreadCount } = useNotifications(isLoggedIn);

  const navItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/library", icon: BookOpen, label: "Library" },
    { path: "/pen", icon: PenTool, label: "Pen" },
  ];

  const isActive = (path: string) => {
    if (path === "/home") return pathname === "/home";
    return pathname.startsWith(path);
  };

  const notificationActive = pathname.startsWith("/notification");

  const allItems = [
    ...navItems.map(({ path, icon, label }) => ({ path, icon, label, isNotification: false })),
    { path: "/notification", icon: Bell, label: "Notification", isNotification: true },
  ];

  return (
    <>
      {/* ── Mobile bottom navbar (hidden on md+) ─────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#f8f7f7] border-t border-[#AFAFAF] w-full sm:max-w-md sm:mx-auto rounded-t-xl z-50 safe-area-bottom">
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
                  className={`text-[10px] sm:text-xs ${Magnetik_Medium.className} transition-colors truncate max-w-full ${
                    active ? "text-primary-colour font-semibold" : "text-[#361B17]"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Notification tab */}
          <Link
            href="/notification"
            prefetch={true}
            className="flex flex-col items-center gap-0.5 sm:gap-1 min-w-0 flex-1 px-1 sm:px-2"
            aria-label="Notification"
            aria-current={notificationActive ? "page" : undefined}
          >
            <span className="relative inline-flex items-center justify-center">
              <Bell
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                  notificationActive ? "fill-[#361B17]" : "text-[#361B17]"
                }`}
              />
              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 opacity-75 animate-ping" />
                  <span
                    className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-500 text-white font-bold leading-none"
                    style={{ fontSize: "7px" }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </>
              )}
            </span>
            <span
              className={`text-[10px] sm:text-xs ${Magnetik_Medium.className} transition-colors truncate max-w-full ${
                notificationActive ? "text-primary-colour font-semibold" : "text-[#361B17]"
              }`}
            >
              Notification
            </span>
          </Link>
        </nav>
      </div>

      {/* ── Tablet / desktop top navbar (hidden below md) ────────────────── */}
      <header className="hidden md:flex sticky top-0 z-50 w-full bg-[#f8f7f7] border-b border-[#AFAFAF] shadow-sm">
        <div className="w-full max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-6 lg:px-8 flex items-center justify-between h-14">
          {/* Brand */}
          <Link href="/home" className={`text-lg font-bold text-[#361B17] ${Magnetik_Bold.className}`}>
            Storytime
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {allItems.map(({ path, icon: Icon, label, isNotification }) => {
              const active = isNotification ? notificationActive : isActive(path);
              return (
                <Link
                  key={path}
                  href={path}
                  prefetch={true}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? `bg-[#361B17]/10 text-[#361B17] font-semibold ${Magnetik_Medium.className}`
                      : `text-[#361B17]/70 hover:bg-[#361B17]/5 hover:text-[#361B17] ${Magnetik_Medium.className}`
                  }`}
                >
                  <span className="relative inline-flex">
                    <Icon className={`w-4 h-4 ${active ? "fill-[#361B17]" : ""}`} />
                    {isNotification && unreadCount > 0 && (
                      <>
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 opacity-75 animate-ping" />
                        <span
                          className="absolute -top-1 -right-1 flex items-center justify-center w-3 h-3 rounded-full bg-red-500 text-white font-bold leading-none"
                          style={{ fontSize: "6px" }}
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      </>
                    )}
                  </span>
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#361B17]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
};

export default Navbar;
