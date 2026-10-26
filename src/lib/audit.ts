import { PrismaClient } from "@prisma/client"

interface CreateAuditLogParams {
  userId?: string
  action: string
  details?: string
  ipAddress?: string
}

/**
 * Creates an audit log entry.
 *
 * @param prismaClient - The Prisma client instance
 * @param params - The audit log parameters
 */
export async function createAuditLog(
  prismaClient: PrismaClient,
  params: CreateAuditLogParams
): Promise<void> {
  await prismaClient.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      details: params.details,
      ipAddress: params.ipAddress,
    },
  })
}
