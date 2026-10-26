import Image from "next/image"

type LogoSize = "sm" | "md" | "lg"

interface SmartLinkLogoProps {
  size?: LogoSize
}

const sizeMap: Record<LogoSize, { image: number; title: string; sub: string }> =
  {
    sm: { image: 40, title: "text-lg", sub: "text-xs" },
    md: { image: 60, title: "text-2xl", sub: "text-sm" },
    lg: { image: 80, title: "text-3xl", sub: "text-base" },
  }

/**
 * SmartLink Digital branding logo component.
 * Renders the logo image alongside the brand name:
 * - "Smart" in white
 * - "Link" in cyan (#00b4ff)
 * - "Digital" below in smaller cyan text
 *
 * @param size - Controls the overall size: 'sm' | 'md' | 'lg' (default: 'md')
 */
export default function SmartLinkLogo({ size = "md" }: SmartLinkLogoProps) {
  const { image, title, sub } = sizeMap[size]

  return (
    <div className="flex items-center gap-3">
      <Image
        src="/smartlink-logo.jpeg"
        alt="SmartLink Digital"
        width={image}
        height={image}
        className="rounded-full"
        priority
      />
      <div className="flex flex-col">
        <span className={`${title} font-bold leading-tight`}>
          <span className="text-white">Smart</span>
          <span style={{ color: "#00b4ff" }}>Link</span>
        </span>
        <span className={`${sub} font-medium`} style={{ color: "#00b4ff" }}>
          Digital
        </span>
      </div>
    </div>
  )
}
