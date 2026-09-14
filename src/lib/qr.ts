import QRCode from "qrcode";
import type { ErrorCorrectionLevel, QRConfig } from "../types";

export interface QROptions {
  foregroundColor?: string;
  backgroundColor?: string;
  margin?: number;
  errorCorrection?: ErrorCorrectionLevel;
  size?: number;
  logoUrl?: string | null;
  logoSize?: number;
}

/**
 * Generate an SVG string representation of the QR code
 */
export async function generateQRSvgString(
  text: string,
  options: QROptions = {}
): Promise<string> {
  const {
    foregroundColor = "#000000",
    backgroundColor = "#ffffff",
    margin = 2,
    errorCorrection = "M",
    logoUrl,
    logoSize = 22,
  } = options;

  // Use higher error correction if logo is present to guarantee scannability
  const effectiveEC = logoUrl && (errorCorrection === "L" || errorCorrection === "M") ? "Q" : errorCorrection;

  const rawSvg = await QRCode.toString(text, {
    type: "svg",
    margin,
    errorCorrectionLevel: effectiveEC,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  });

  if (!logoUrl) {
    return rawSvg;
  }

  // Inject logo inside SVG
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rawSvg, "image/svg+xml");
    const svgElem = xmlDoc.querySelector("svg");
    if (!svgElem) return rawSvg;

    const viewBoxAttr = svgElem.getAttribute("viewBox");
    let vbWidth = 200;
    let vbHeight = 200;
    if (viewBoxAttr) {
      const parts = viewBoxAttr.split(/\s+/).map(Number);
      if (parts.length === 4) {
        vbWidth = parts[2];
        vbHeight = parts[3];
      }
    }

    const logoPxWidth = vbWidth * (logoSize / 100);
    const logoPxHeight = vbHeight * (logoSize / 100);
    const posX = (vbWidth - logoPxWidth) / 2;
    const posY = (vbHeight - logoPxHeight) / 2;
    const pad = Math.max(2, logoPxWidth * 0.12);

    // Create group for logo container
    const g = xmlDoc.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("id", "qr-center-logo");

    // Background badge for logo
    const bgRect = xmlDoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    bgRect.setAttribute("x", String(posX - pad));
    bgRect.setAttribute("y", String(posY - pad));
    bgRect.setAttribute("width", String(logoPxWidth + pad * 2));
    bgRect.setAttribute("height", String(logoPxHeight + pad * 2));
    bgRect.setAttribute("rx", String((logoPxWidth + pad * 2) * 0.18));
    bgRect.setAttribute("fill", backgroundColor === "transparent" ? "#ffffff" : backgroundColor);
    bgRect.setAttribute("stroke", foregroundColor);
    bgRect.setAttribute("stroke-opacity", "0.15");
    bgRect.setAttribute("stroke-width", "0.5");
    g.appendChild(bgRect);

    // Image element
    const imgElem = xmlDoc.createElementNS("http://www.w3.org/2000/svg", "image");
    imgElem.setAttribute("x", String(posX));
    imgElem.setAttribute("y", String(posY));
    imgElem.setAttribute("width", String(logoPxWidth));
    imgElem.setAttribute("height", String(logoPxHeight));
    imgElem.setAttribute("preserveAspectRatio", "xMidYMid meet");
    imgElem.setAttribute("href", logoUrl);
    g.appendChild(imgElem);

    svgElem.appendChild(g);

    return new XMLSerializer().serializeToString(xmlDoc);
  } catch (err) {
    console.warn("Could not embed logo in SVG:", err);
    return rawSvg;
  }
}

/**
 * Render QR code to an HTML Canvas
 */
export async function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options: QROptions = {}
): Promise<void> {
  const {
    foregroundColor = "#000000",
    backgroundColor = "#ffffff",
    margin = 2,
    errorCorrection = "M",
    size = 320,
    logoUrl,
    logoSize = 22,
  } = options;

  const effectiveEC = logoUrl && (errorCorrection === "L" || errorCorrection === "M") ? "Q" : errorCorrection;

  // Set explicit canvas dimensions
  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin,
    errorCorrectionLevel: effectiveEC,
    color: {
      dark: foregroundColor,
      light: backgroundColor === "transparent" ? "#00000000" : backgroundColor,
    },
  });

  if (logoUrl) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const logoTargetSize = size * (logoSize / 100);
        const pad = Math.max(4, logoTargetSize * 0.14);
        const x = (size - logoTargetSize) / 2;
        const y = (size - logoTargetSize) / 2;
        const badgeSize = logoTargetSize + pad * 2;
        const badgeX = x - pad;
        const badgeY = y - pad;
        const radius = Math.max(6, badgeSize * 0.22);

        // Draw protective background badge
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, radius);
        ctx.fillStyle = backgroundColor === "transparent" ? "#ffffff" : backgroundColor;
        ctx.fill();

        // Subtle stroke
        ctx.strokeStyle = foregroundColor;
        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Clip image into rounded rect
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, logoTargetSize, logoTargetSize, radius * 0.8);
        ctx.clip();
        ctx.drawImage(img, x, y, logoTargetSize, logoTargetSize);
        ctx.restore();

        resolve();
      };
      img.onerror = () => {
        resolve(); // Continue even if logo fails
      };
      img.src = logoUrl;
    });
  }
}

/**
 * Generate high-resolution PNG blob
 */
export async function generateHighResPngBlob(
  text: string,
  options: QROptions,
  targetResolution = 1024
): Promise<Blob> {
  const offscreenCanvas = document.createElement("canvas");
  await renderQRToCanvas(offscreenCanvas, text, {
    ...options,
    size: targetResolution,
  });

  return new Promise((resolve, reject) => {
    offscreenCanvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to generate canvas blob"));
    }, "image/png");
  });
}

/**
 * Trigger file download in browser
 */
export function downloadFile(data: Blob | string, filename: string): void {
  const url = typeof data === "string" ? data : URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  if (typeof data !== "string") {
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
