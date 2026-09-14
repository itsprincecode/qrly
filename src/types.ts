export type PlatformType =
  | "website"
  | "instagram"
  | "youtube"
  | "linkedin"
  | "github"
  | "twitter"
  | "facebook"
  | "whatsapp"
  | "telegram"
  | "email"
  | "custom";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QRConfig {
  type: PlatformType;
  inputVal: string;
  extraVal?: string; // For WhatsApp prefill text or Email subject
  extraVal2?: string; // For Email body
  computedUrl: string;
  foregroundColor: string;
  backgroundColor: string;
  transparentBackground: boolean;
  size: number;
  margin: number;
  errorCorrection: ErrorCorrectionLevel;
  logoUrl: string | null;
  logoSize: number; // percentage, default 22
}

export interface PlatformPreset {
  id: PlatformType;
  name: string;
  iconName: string;
  placeholder: string;
  prefix: string;
  description: string;
  example: string;
  helperText?: string;
  hasExtraFields?: "whatsapp" | "email";
}

export interface StoredQRCode {
  id: string;
  created_at: string;
  type: PlatformType;
  original_url: string;
  display_name: string;
  foreground_color: string;
  background_color: string;
  size: number;
  margin: number;
  error_correction: ErrorCorrectionLevel;
  has_logo: boolean;
  created_by?: string | null;
  download_count: number;
}

export interface DeveloperInfo {
  name: string;
  role: string;
  bio: string;
  website: string;
  github: string;
  linkedin: string;
  instagram: string;
  email: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}
