import { prisma } from '../lib/prisma';

export interface CompOffItem {
  id: number;
  employeeId: string;
  employeeName: string;
  workedDate: string;
  hoursWorked: number;
  daysCredit: number;
  reason: string;
  status: 'Pending_PM' | 'Pending_SA' | 'Approved' | 'Rejected';
  pmApproval?: string;
  saApproval?: string;
  createdAt: string;
}

export class CompOffService {
  static async applyCompOff(user: { id: number; employeeId: string; fullName: string; role: string }, data: { workedDate: string; hoursWorked: number; reason: string; daysCredit?: number }): Promise<CompOffItem> {
    if (!data.workedDate || !data.hoursWorked || !data.reason.trim()) throw new Error('Worked date, hours worked, and reason are required.');
    const targetStatus = user.role === 'Project Manager' ? 'Pending_SA' : 'Pending_PM';
    const record = await prisma.compOffRequest.create({
      data: {
        employeeId: user.employeeId || `AODE${String(user.id).padStart(4, '0')}`,
        employeeName: user.fullName,
        workedDate: data.workedDate.trim(),
        hoursWorked: Number(data.hoursWorked) || 8,
        daysCredit: data.daysCredit || (data.hoursWorked >= 7 ? 1.0 : 0.5),
        reason: data.reason.trim(),
        status: targetStatus,
        pmApproval: user.role === 'Project Manager' ? 'Approved' : 'Pending',
        saApproval: 'Pending',
      },
    });
    return {
      id: record.id, employeeId: record.employeeId, employeeName: record.employeeName,
      workedDate: record.workedDate, hoursWorked: record.hoursWorked, daysCredit: record.daysCredit,
      reason: record.reason, status: record.status as any, pmApproval: record.pmApproval || 'Pending',
      saApproval: record.saApproval || 'Pending', createdAt: record.createdAt.toISOString(),
    };
  }

  static async getCompOffRequests(user: { id: number; employeeId: string; role: string }): Promise<CompOffItem[]> {
    const where: any = {};
    if (user.role === 'Employee') {
      where.employeeId = user.employeeId || `AODE${String(user.id).padStart(4, '0')}`;
    }
    const records = await prisma.compOffRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
    return records.map((r) => ({
      id: r.id, employeeId: r.employeeId, employeeName: r.employeeName,
      workedDate: r.workedDate, hoursWorked: r.hoursWorked, daysCredit: r.daysCredit,
      reason: r.reason, status: r.status as any, pmApproval: r.pmApproval || 'Pending',
      saApproval: r.saApproval || 'Pending', createdAt: r.createdAt.toISOString(),
    }));
  }

  static async approveOrRejectCompOff(user: { id: number; employeeId: string; fullName: string; role: string }, id: number, action: 'approve' | 'reject'): Promise<CompOffItem> {
    if (user.role !== 'Project Manager' && user.role !== 'Super Admin') throw new Error('Access Denied: Only PMs and Super Admins can review comp-off claims.');
    const existing = await prisma.compOffRequest.findUnique({ where: { id } });
    if (!existing) throw new Error(`Comp-off request with ID ${id} not found.`);
    if (action === 'reject') {
      const updated = await prisma.compOffRequest.update({
        where: { id },
        data: {
          status: 'Rejected',
          pmApproval: user.role === 'Project Manager' ? 'Rejected' : existing.pmApproval,
          saApproval: user.role === 'Super Admin' ? 'Rejected' : existing.saApproval,
        },
      });
      return {
        id: updated.id, employeeId: updated.employeeId, employeeName: updated.employeeName,
        workedDate: updated.workedDate, hoursWorked: updated.hoursWorked, daysCredit: updated.daysCredit,
        reason: updated.reason, status: 'Rejected', pmApproval: updated.pmApproval || 'Rejected',
        saApproval: updated.saApproval || 'Rejected', createdAt: updated.createdAt.toISOString(),
      };
    }

    let nextStatus: string = existing.status;
    let pmStatus = existing.pmApproval || 'Pending';
    let saStatus = existing.saApproval || 'Pending';

    if (user.role === 'Project Manager') {
      pmStatus = 'Approved';
      nextStatus = 'Pending_SA';
    } else if (user.role === 'Super Admin') {
      saStatus = 'Approved';
      if (pmStatus === 'Approved' || existing.status === 'Pending_SA') {
        nextStatus = 'Approved';
      } else {
        pmStatus = 'Approved';
        nextStatus = 'Approved';
      }
    }

    const updated = await prisma.compOffRequest.update({
      where: { id },
      data: { status: nextStatus, pmApproval: pmStatus, saApproval: saStatus },
    });

    if (nextStatus === 'Approved') {
      const currentYear = Number(existing.workedDate.slice(0, 4)) || new Date().getFullYear();
      await prisma.employeeLeaveBalance.upsert({
        where: { employeeId_year: { employeeId: existing.employeeId, year: currentYear } },
        update: { compOffBalance: { increment: existing.daysCredit || 1.0 } },
        create: {
          employeeId: existing.employeeId, year: currentYear,
          compOffBalance: existing.daysCredit || 1.0, casualQuota: 12, sickQuota: 12, earnedQuota: 15,
        },
      });
    }

    return {
      id: updated.id, employeeId: updated.employeeId, employeeName: updated.employeeName,
      workedDate: updated.workedDate, hoursWorked: updated.hoursWorked, daysCredit: updated.daysCredit,
      reason: updated.reason, status: updated.status as any, pmApproval: updated.pmApproval || 'Pending',
      saApproval: updated.saApproval || 'Pending', createdAt: updated.createdAt.toISOString(),
    };
  }
}
