import { prisma } from '../lib/prisma';

export interface LeaveBalanceData {
  employeeId: string; year: number; casualQuota: number; casualUsed: number;
  casualRemaining: number; sickQuota: number; sickUsed: number; sickRemaining: number;
  earnedQuota: number; earnedUsed: number; earnedRemaining: number; compOffBalance: number;
  optionalHolidaysQuota: number; optionalHolidaysUsed: number; optionalHolidaysRemaining: number;
  wfhMonthlyLimit: number; wfhUsedThisMonth: number; wfhRemainingThisMonth: number;
}

export class LeaveService {
  static async getBalance(employeeId: string, year: number = 2026): Promise<LeaveBalanceData> {
    let balance = await prisma.employeeLeaveBalance.findUnique({
      where: { employeeId_year: { employeeId, year } },
    });
    if (!balance) {
      balance = await prisma.employeeLeaveBalance.create({
        data: {
          employeeId, year, casualQuota: 12, casualUsed: 0, sickQuota: 12,
          sickUsed: 0, earnedQuota: 15, earnedUsed: 0, compOffBalance: 0,
          optionalHolidaysQuota: 2, optionalHolidaysUsed: 0, wfhMonthlyLimit: 2, wfhUsedThisMonth: 0,
        },
      });
    }
    return {
      employeeId: balance.employeeId, year: balance.year, casualQuota: balance.casualQuota,
      casualUsed: balance.casualUsed, casualRemaining: Math.max(0, balance.casualQuota - balance.casualUsed),
      sickQuota: balance.sickQuota, sickUsed: balance.sickUsed, sickRemaining: Math.max(0, balance.sickQuota - balance.sickUsed),
      earnedQuota: balance.earnedQuota, earnedUsed: balance.earnedUsed, earnedRemaining: Math.max(0, balance.earnedQuota - balance.earnedUsed),
      compOffBalance: balance.compOffBalance, optionalHolidaysQuota: balance.optionalHolidaysQuota,
      optionalHolidaysUsed: balance.optionalHolidaysUsed, optionalHolidaysRemaining: Math.max(0, balance.optionalHolidaysQuota - balance.optionalHolidaysUsed),
      wfhMonthlyLimit: balance.wfhMonthlyLimit, wfhUsedThisMonth: balance.wfhUsedThisMonth,
      wfhRemainingThisMonth: Math.max(0, balance.wfhMonthlyLimit - balance.wfhUsedThisMonth),
    };
  }

  static async applyLeave(user: { id: number; employeeId: string; fullName: string; role: string }, data: { leaveType: string; startDate: string; endDate: string; isHalfDay?: boolean; halfDaySession?: string; reason: string }): Promise<any> {
    const empId = user.employeeId || `AODE${String(user.id).padStart(4, '0')}`;
    const year = Number(data.startDate.slice(0, 4)) || 2026;
    const balance = await this.getBalance(empId, year);
    const isHalfDay = !!data.isHalfDay;
    const daysCount = isHalfDay ? 0.5 : 1.0;

    if (data.leaveType === 'Optional Holiday' && balance.optionalHolidaysRemaining < 1) {
      throw new Error(`You have exhausted your annual Optional Holiday quota (${balance.optionalHolidaysQuota} max).`);
    }
    if (data.leaveType === 'Work From Home' && balance.wfhRemainingThisMonth < 1) {
      throw new Error(`You have reached your monthly WFH limit (${balance.wfhMonthlyLimit} days/month).`);
    }
    if (data.leaveType === 'Comp-off' && balance.compOffBalance < daysCount) {
      throw new Error(`Insufficient Comp-off balance. You currently have ${balance.compOffBalance} days available.`);
    }

    const targetStatus = user.role === 'Project Manager' ? 'Pending_SA' : 'Pending_PM';
    const record = await prisma.leaveRequest.create({
      data: {
        employeeId: empId, employeeName: user.fullName, leaveType: data.leaveType,
        startDate: data.startDate, endDate: isHalfDay ? data.startDate : data.endDate,
        isHalfDay, halfDaySession: isHalfDay ? data.halfDaySession || 'First Half' : null,
        daysCount, reason: data.reason.trim(), status: targetStatus,
        pmApproval: user.role === 'Project Manager' ? 'Approved' : 'Pending', saApproval: 'Pending',
      },
    });
    return record;
  }

  static async getLeaveRequests(user: { id: number; employeeId: string; role: string }): Promise<any[]> {
    const where: any = {};
    if (user.role === 'Employee') {
      where.employeeId = user.employeeId || `AODE${String(user.id).padStart(4, '0')}`;
    }
    return prisma.leaveRequest.findMany({ where, orderBy: { appliedAt: 'desc' } });
  }

  static async approveOrRejectLeave(user: { id: number; employeeId: string; fullName: string; role: string }, id: number, action: 'approve' | 'reject', remarks?: string): Promise<any> {
    if (user.role !== 'Project Manager' && user.role !== 'Super Admin') throw new Error('Unauthorized');
    const existing = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!existing) throw new Error('Leave request not found');

    if (action === 'reject') {
      return prisma.leaveRequest.update({
        where: { id },
        data: { status: 'Rejected', rejectionReason: remarks || 'Declined', pmApproval: user.role === 'Project Manager' ? 'Rejected' : existing.pmApproval, saApproval: user.role === 'Super Admin' ? 'Rejected' : existing.saApproval },
      });
    }

    const nextStatus = 'Approved';
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status: nextStatus, pmApproval: 'Approved', saApproval: user.role === 'Super Admin' ? 'Approved' : existing.saApproval, approverName: user.fullName },
    });

    const year = Number(existing.startDate.slice(0, 4)) || 2026;
    if (existing.leaveType === 'Casual Leave') {
      await prisma.employeeLeaveBalance.update({ where: { employeeId_year: { employeeId: existing.employeeId, year } }, data: { casualUsed: { increment: existing.daysCount } } });
    } else if (existing.leaveType === 'Sick Leave') {
      await prisma.employeeLeaveBalance.update({ where: { employeeId_year: { employeeId: existing.employeeId, year } }, data: { sickUsed: { increment: existing.daysCount } } });
    } else if (existing.leaveType === 'Earned Leave') {
      await prisma.employeeLeaveBalance.update({ where: { employeeId_year: { employeeId: existing.employeeId, year } }, data: { earnedUsed: { increment: existing.daysCount } } });
    } else if (existing.leaveType === 'Comp-off') {
      await prisma.employeeLeaveBalance.update({ where: { employeeId_year: { employeeId: existing.employeeId, year } }, data: { compOffBalance: { decrement: existing.daysCount } } });
    } else if (existing.leaveType === 'Optional Holiday') {
      await prisma.employeeLeaveBalance.update({ where: { employeeId_year: { employeeId: existing.employeeId, year } }, data: { optionalHolidaysUsed: { increment: 1 } } });
    } else if (existing.leaveType === 'Work From Home') {
      await prisma.employeeLeaveBalance.update({ where: { employeeId_year: { employeeId: existing.employeeId, year } }, data: { wfhUsedThisMonth: { increment: 1 } } });
    }
    return updated;
  }

  static async getAttendanceMatrix(monthYear: string = '2026-08'): Promise<any> {
    const employees = await prisma.employee.findMany({ select: { employeeId: true, fullName: true, designation: true, role: true, department: true } });
    const approvedLeaves = await prisma.leaveRequest.findMany({ where: { status: 'Approved', startDate: { startsWith: monthYear } } });
    const holidays = await prisma.holiday.findMany({ where: { isPublished: true, date: { startsWith: monthYear } } });
    return { monthYear, employees, approvedLeaves, holidays };
  }

  static async getLeaveConfigs(year: number = 2026): Promise<any[]> {
    let configs = await prisma.leaveTypeConfig.findMany({ where: { year } });
    if (configs.length === 0) {
      await prisma.leaveTypeConfig.createMany({
        data: [
          { code: 'CL', name: 'Casual Leave', annualQuota: 12, monthlyAccrual: 1.0, year },
          { code: 'SL', name: 'Sick Leave', annualQuota: 12, monthlyAccrual: 1.0, year },
          { code: 'EL', name: 'Earned Leave', annualQuota: 15, monthlyAccrual: 1.25, year },
          { code: 'WFH', name: 'Work From Home', annualQuota: 24, monthlyAccrual: 2.0, year },
          { code: 'OH', name: 'Optional Holiday', annualQuota: 2, monthlyAccrual: 0, year },
        ],
      });
      configs = await prisma.leaveTypeConfig.findMany({ where: { year } });
    }
    return configs;
  }

  static async createLeaveConfig(role: string, data: { name: string; code?: string; monthlyAccrual?: number; annualQuota?: number; allowHalfDay?: boolean; maxCarryForward?: number; year?: number }): Promise<any> {
    if (role !== 'Super Admin') throw new Error('Access Denied: Only Super Admins can add leave types.');
    const year = data.year || 2026;
    const name = data.name.trim();
    const code = (data.code?.trim() || name.slice(0, 3)).toUpperCase();
    const existing = await prisma.leaveTypeConfig.findFirst({ where: { year, OR: [{ code }, { name }] } });
    if (existing) throw new Error(`Leave type "${name}" or code "${code}" already exists for ${year}.`);
    return prisma.leaveTypeConfig.create({
      data: {
        name, code, monthlyAccrual: Number(data.monthlyAccrual) || 1.0,
        annualQuota: Number(data.annualQuota) || 12, allowHalfDay: data.allowHalfDay ?? true,
        maxCarryForward: Number(data.maxCarryForward) || 0,
        year,
      },
    });
  }

  static async updateLeaveConfig(role: string, id: number, data: any): Promise<any> {
    if (role !== 'Super Admin') throw new Error('Access Denied');
    return prisma.leaveTypeConfig.update({ where: { id }, data });
  }

  static async deleteLeaveConfig(role: string, id: number): Promise<{ success: boolean }> {
    if (role !== 'Super Admin') throw new Error('Access Denied: Only Super Admins can delete leave types.');
    await prisma.leaveTypeConfig.delete({ where: { id } });
    return { success: true };
  }
}
