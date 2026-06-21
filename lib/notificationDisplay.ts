export function getNotificationIcon(type: string): string {
  switch (type) {
    case "achievement":
      return "🏆";
    case "milestone":
      return "🎓";
    case "story_like":
      return "❤️";
    case "story_comment":
      return "💬";
    case "story_collaboration":
      return "🤝";
    case "reminder_read":
      return "⏰";
    case "reminder_write":
      return "✍️";
    case "admin_message":
      return "📢";
    case "system":
      return "📢";
    default:
      return "🔔";
  }
}

export function stripLeadingEmojis(text: string): string {
  const stripped = text
    .replace(
      /^(\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*\s*)+/u,
      "",
    )
    .trim();
  return stripped.length > 0 ? stripped : text;
}

export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString();
}

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
  emailSentAt?: string;
  isRead: boolean;
};
