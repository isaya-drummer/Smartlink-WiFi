"use client"

import Image from "next/image"

type LogoSize = "sm" | "md" | "lg"

interface SmartLinkLogoProps {
  size?: LogoSize
  theme?: string // optional override, otherwise reads from html class
}

const sizeMap: Record<LogoSize, { image: number; title: string; sub: string }> = {
  sm: { image: 40, title: "text-lg",  sub: "text-xs" },
  md: { image: 60, title: "text-2xl", sub: "text-sm" },
  lg: { image: 80, title: "text-3xl", sub: "text-base" },
}

/**
 * Smartlink WiFi branding logo component.
 * - Dark theme: uses logo-dark.jpeg (black background)
 * - All other themes: uses logo-light.jpeg (white background)
 *
 * Name: "Smartlink" in white + "WiFi" in accent color
 * Tagline: "We're here for you, daily"
 */
export default function SmartLinkLogo({ size = "md", theme }: SmartLinkLogoProps) {
  const { image, title, sub } = sizeMap[size]

  // Determine which logo to show based on theme class on <html>
  // Falls back to light logo when theme is unknown (SSR safe)
  const isDark =
    theme === "dark" ||
    (typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"))

  const logoSrc = isDark ? "/logo-dark.jpeg" : "/logo-light.jpeg"

  return (
    <div className="flex items-center gap-3">
      <Image
        src={logoSrc}
        alt="Smartlink WiFi"
        width={image}
        height={image}
        className="rounded-full object-cover"
        priority
      />
      <div className="flex flex-col">
        <span className={`${title} font-bold leading-tight`}>
          <span style={{ color: "var(--text-primary, #ffffff)" }}>Smartlink</span>
          <span style={{ color: "var(--accent, #00b4ff)" }}> WiFi</span>
        </span>
        <span className={`${sub} font-medium`} style={{ color: "var(--accent, #00b4ff)", opacity: 0.85 }}>
          We&apos;re here for you, daily
        </span>
      </div>
    </div>
  )
}
