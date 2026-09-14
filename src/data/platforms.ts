import type { PlatformPreset, PlatformType } from "../types";

export const PLATFORMS: PlatformPreset[] = [
  {
    id: "website",
    name: "Website",
    iconName: "Globe",
    placeholder: "example.com or https://example.com",
    prefix: "https://",
    description: "Any website or web link",
    example: "https://example.com",
    helperText: "Enter your domain or full URL",
  },
  {
    id: "instagram",
    name: "Instagram",
    iconName: "Instagram",
    placeholder: "username or full profile link",
    prefix: "https://instagram.com/",
    description: "Instagram profile or post",
    example: "https://instagram.com/designcode",
    helperText: "Enter handle (e.g. username) or profile link",
  },
  {
    id: "youtube",
    name: "YouTube",
    iconName: "Youtube",
    placeholder: "@channel or video link",
    prefix: "https://youtube.com/@",
    description: "YouTube channel or video",
    example: "https://youtube.com/@designcode",
    helperText: "Enter @channel name or full video URL",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    iconName: "Linkedin",
    placeholder: "username or profile URL",
    prefix: "https://linkedin.com/in/",
    description: "Personal profile or company page",
    example: "https://linkedin.com/in/alexmorgan",
    helperText: "Enter profile handle or full URL",
  },
  {
    id: "github",
    name: "GitHub",
    iconName: "Github",
    placeholder: "username or repository",
    prefix: "https://github.com/",
    description: "GitHub developer profile or repo",
    example: "https://github.com/torvalds",
    helperText: "Enter GitHub username or repo link",
  },
  {
    id: "twitter",
    name: "X / Twitter",
    iconName: "Twitter",
    placeholder: "username or post URL",
    prefix: "https://x.com/",
    description: "X profile or tweet link",
    example: "https://x.com/designcode",
    helperText: "Enter X handle (without @) or profile link",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    iconName: "MessageCircle",
    placeholder: "1234567890 (include country code)",
    prefix: "https://wa.me/",
    description: "Direct WhatsApp chat link with message",
    example: "https://wa.me/15551234567",
    helperText: "Enter phone number without + or spaces",
    hasExtraFields: "whatsapp",
  },
  {
    id: "telegram",
    name: "Telegram",
    iconName: "Send",
    placeholder: "username or channel",
    prefix: "https://t.me/",
    description: "Telegram direct profile or channel",
    example: "https://t.me/telegram",
    helperText: "Enter Telegram username or link",
  },
  {
    id: "email",
    name: "Email",
    iconName: "Mail",
    placeholder: "contact@example.com",
    prefix: "mailto:",
    description: "Direct email trigger with subject",
    example: "mailto:contact@example.com",
    helperText: "Enter recipient email address",
    hasExtraFields: "email",
  },
  {
    id: "facebook",
    name: "Facebook",
    iconName: "Share2",
    placeholder: "username or page URL",
    prefix: "https://facebook.com/",
    description: "Facebook profile, group, or page",
    example: "https://facebook.com/meta",
    helperText: "Enter page or profile link",
  },
  {
    id: "custom",
    name: "Custom URL",
    iconName: "Link2",
    placeholder: "https://any-link.com/deep/path",
    prefix: "https://",
    description: "Custom link, deep link, or scheme",
    example: "https://myapp.com/invite?code=123",
    helperText: "Supports any valid URI scheme",
  },
];

export function computeDestinationUrl(
  type: PlatformType,
  inputVal: string,
  extraVal = "",
  extraVal2 = ""
): string {
  const trimmed = inputVal.trim();
  if (!trimmed) return "";

  // If already a full http/https or custom scheme URL
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  switch (type) {
    case "website":
      return `https://${trimmed.replace(/^https?:\/\//i, "")}`;

    case "instagram": {
      const handle = trimmed.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/\/$/, "");
      return `https://instagram.com/${handle}`;
    }

    case "youtube": {
      if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
        return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      }
      const channel = trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
      return `https://youtube.com/${channel}`;
    }

    case "linkedin": {
      if (trimmed.includes("linkedin.com")) {
        return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      }
      return `https://linkedin.com/in/${trimmed.replace(/^\/+/, "")}`;
    }

    case "github": {
      if (trimmed.includes("github.com")) {
        return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      }
      return `https://github.com/${trimmed.replace(/^\/+/, "")}`;
    }

    case "twitter": {
      if (trimmed.includes("x.com") || trimmed.includes("twitter.com")) {
        return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      }
      const handle = trimmed.replace(/^@/, "");
      return `https://x.com/${handle}`;
    }

    case "facebook": {
      if (trimmed.includes("facebook.com")) {
        return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      }
      return `https://facebook.com/${trimmed.replace(/^\/+/, "")}`;
    }

    case "whatsapp": {
      // Clean phone numbers: remove +, spaces, dashes, parentheses
      const cleanPhone = trimmed.replace(/[^0-9]/g, "");
      let url = `https://wa.me/${cleanPhone}`;
      if (extraVal.trim()) {
        url += `?text=${encodeURIComponent(extraVal.trim())}`;
      }
      return url;
    }

    case "telegram": {
      if (trimmed.includes("t.me")) {
        return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      }
      const handle = trimmed.replace(/^@/, "");
      return `https://t.me/${handle}`;
    }

    case "email": {
      const email = trimmed.replace(/^mailto:/i, "");
      let mailto = `mailto:${email}`;
      const params: string[] = [];
      if (extraVal.trim()) {
        params.push(`subject=${encodeURIComponent(extraVal.trim())}`);
      }
      if (extraVal2.trim()) {
        params.push(`body=${encodeURIComponent(extraVal2.trim())}`);
      }
      if (params.length > 0) {
        mailto += `?${params.join("&")}`;
      }
      return mailto;
    }

    case "custom":
    default:
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
        return trimmed;
      }
      return `https://${trimmed}`;
  }
}
