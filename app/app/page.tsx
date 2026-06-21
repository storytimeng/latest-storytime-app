import { redirect } from "next/navigation";
import { DESKTOP_ROUTES } from "@/config/desktopRoutes";

export default function DesktopAppIndexPage() {
  redirect(DESKTOP_ROUTES.home);
}
