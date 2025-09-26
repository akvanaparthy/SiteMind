import { LogStatus } from "@prisma/client";
import { prisma } from "../../../src/lib/prisma";

export interface AgentLogDetail {
  action: string;
  status: "pending" | "success" | "failed";
  timestamp: Date;
  details?: string;
}

export class AgentLogger {
  async logTask(
    taskId: string,
    task: string,
    status: LogStatus = LogStatus.PENDING,
    details?: AgentLogDetail[],
    parentId?: number
  ) {
    return await prisma.agentLog.create({
      data: {
        taskId,
        task,
        status,
        details: details ? JSON.stringify(details) : null,
        parentId,
      },
    });
  }

  async updateTaskStatus(
    id: number,
    status: LogStatus,
    details?: AgentLogDetail[]
  ) {
    return await prisma.agentLog.update({
      where: { id },
      data: {
        status,
        details: details ? JSON.stringify(details) : undefined,
      },
    });
  }

  async getTaskLogs(limit: number = 50) {
    return await prisma.agentLog.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { timestamp: "asc" },
        },
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  async getTaskById(taskId: string) {
    return await prisma.agentLog.findFirst({
      where: { taskId },
      include: {
        children: {
          orderBy: { timestamp: "asc" },
        },
      },
    });
  }
}
