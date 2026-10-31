import { NextResponse } from "next/server"
import { prisma, withRetry } from "@/lib/prisma"

export async function GET() {
  try {
    const settings = await withRetry(() =>
      prisma.systemSettings.findMany({
        where: {
          key: {
            in: [
              "admin_phone",
              "admin_whatsapp",
              "hotspot_name",
              "welcome_message",
            ],
          },
        },
      })
    )

    const map: Record<string, string> = {
      admin_phone: "+255 744 000 000",
      admin_whatsapp: "255744000000",
      hotspot_name: "SmartLink Digital Hotspot",
      welcome_message: "We're here for you, daily",
    }

    settings.forEach((s) => {
      if (s.value && s.value.trim().length > 0) {
        map[s.key] = s.value.trim()
      }
    })

    return NextResponse.json(map)
  } catch (error) {
    console.error("Error fetching portal settings:", error)
    return NextResponse.json({
      admin_phone: "+255 744 000 000",
      admin_whatsapp: "255744000000",
      hotspot_name: "SmartLink Digital Hotspot",
      welcome_message: "We're here for you, daily",
    })
  }
}

