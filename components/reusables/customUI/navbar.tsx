import { Button } from "@/components/ui/button";
import { Home, BookOpen, PenTool, Bell } from "lucide-react";
import React from "react";
import { Magnetik_Medium } from "@/lib/font";
import Link from "next/link";

const Navbar = () => {
  return (
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f8f7f7] border-t border-border max-w-sm mx-auto rounded-t-xl border-t-[#AFAFAF]">
        <div className="flex items-center justify-around py-3 px-2">
          <Link href="/app/">
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-1 text-primary min-w-0 flex-1"
            >
              <Home className="w-5 h-5  fill-[#361B17]" />
              <span
                className={`text-xs text-[#361B17] ${Magnetik_Medium.className}`}
              >
                Home
              </span>
            </Button>
          </Link>
          <Link href="/app/library">
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-1 text-muted-foreground min-w-0 flex-1"
            >
              <BookOpen className="w-5 h-5 text-[#361B17]" />
              <span
                className={`text-xs text-[#361B17] ${Magnetik_Medium.className}`}
              >
                Library
              </span>
            </Button>
          </Link>
          <Link href="/app/pen">
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-1 text-muted-foreground min-w-0 flex-1"
            >
              <PenTool className="w-5 h-5 text-[#361B17]" />
              <span
                className={`text-xs text-[#361B17] ${Magnetik_Medium.className}`}
              >
                Pen
              </span>
            </Button>
          </Link>
          <Link href="/app/notification">
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-1 text-muted-foreground min-w-0 flex-1"
            >
              <Bell className="w-5 h-5 text-[#361B17]" />
              <span
                className={`text-xs text-[#361B17] ${Magnetik_Medium.className}`}
              >
                Notification
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
