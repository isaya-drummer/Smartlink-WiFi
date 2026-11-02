"use client"

import SmartLinkLogo from "@/components/SmartLinkLogo"
import { useTheme } from "@/context/ThemeContext"

type LogoSize = "sm" | "md" | "lg"

export default function SmartLinkLogoThemed({ size = "md" }: { size?: LogoSize }) {
  const { theme } = useTheme()
  return <SmartLinkLogo size={size} theme={theme} />
}
