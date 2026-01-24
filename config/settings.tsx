import {
  Bell,
  Shield,
  Key,
  HelpCircle,
  Phone,
  Trash2,
  LogOut,
  Database,
} from "lucide-react";
import { SettingOption } from "@/components/reusables/customUI/SettingsOption";

/**
 * Settings configuration
 * Centralized configuration for all settings options
 * Easy to modify, extend, or reorder settings
 */
export const SETTINGS_OPTIONS: SettingOption[] = [
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell size={20} />,
    hasToggle: true,
    isEnabled: true,
  },
  {
    id: "security",
    label: "Security",
    icon: <Shield size={20} />,
    hasToggle: false,
    // No route, opens modal
  },
  {
    id: "change-password",
    label: "Change password",
    icon: <Key size={20} />,
    hasToggle: false,
    route: "/auth/update-password?from=settings",
  },
  {
    id: "clear-cache",
    label: "Clear Cache",
    icon: <Database size={20} />,
    hasToggle: false,
    // No route, opens modal
  },
  {
    id: "faqs",
    label: "FAQs",
    icon: <HelpCircle size={20} />,
    hasToggle: false,
    // No route, opens modal
  },
  {
    id: "terms-policy",
    label: "Terms & Policy",
    icon: <Shield size={20} />,
    hasToggle: false,
    // No route, opens modal
  },
  {
    id: "support",
    label: "Support",
    icon: <Phone size={20} />,
    hasToggle: false,
    // No route, opens modal
  },
  {
    id: "delete-account",
    label: "Delete Account",
    icon: <Trash2 size={20} />,
    hasToggle: false,
    isDanger: true,
    // No route, opens modal
  },
  {
    id: "logout",
    label: "Log Out",
    icon: <LogOut size={20} />,
    hasToggle: false,
    isDanger: true,
    // No route, opens modal
  },
];
