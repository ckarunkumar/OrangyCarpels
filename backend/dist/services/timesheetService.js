"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimesheetService = void 0;
const prisma_1 = require("../lib/prisma");
class TimesheetService {
    /**
     * Retrieves a timesheet for a given week. Creates a draft if it doesn't exist.
     */
    static async getWeeklySheet(weekStart) {
        let sheet = await prisma_1.prisma.timesheet.findUnique({
            where: { weekStart },
            include: { rows: true },
        });
        if (!sheet) {
            sheet = await prisma_1.prisma.timesheet.create({
                data: {
                    weekStart,
                    status: 'Draft',
                },
                include: { rows: true },
            });
        }
        return {
            weekStart: sheet.weekStart,
            status: sheet.status,
            rows: sheet.rows.map((r) => ({
                id: r.id,
                client: r.client,
                project: r.project,
                task: r.task,
                billable: r.billable,
                hours: [r.mon, r.tue, r.wed, r.thu, r.fri, r.sat, r.sun],
            })),
        };
    }
    /**
     * Saves a timesheet as a Draft.
     */
    static async saveDraft(weekStart, role, rows) {
        const sheet = await this.getWeeklySheet(weekStart);
        // Lock checks
        if (sheet.status === 'Submitted' && role === 'Employee') {
            return { success: false, error: 'Timesheet is submitted for review and locked for employee edits.' };
        }
        if (sheet.status === 'Approved' && role !== 'Super Admin') {
            return { success: false, error: 'Timesheet is approved and closed. Only Super Admins can override.' };
        }
        // Validate hours constraints
        for (const row of rows) {
            if (row.hours.length !== 7) {
                return { success: false, error: 'Each row must contain exactly 7 daily hour inputs.' };
            }
            for (const hr of row.hours) {
                if (hr < 0 || hr > 24) {
                    return { success: false, error: 'Daily hours must be between 0 and 24.' };
                }
            }
        }
        // Persist rows inside transaction to avoid orphaned rows
        try {
            const dbSheet = await prisma_1.prisma.timesheet.findUnique({
                where: { weekStart },
            });
            if (!dbSheet)
                throw new Error('Timesheet period not initialized.');
            await prisma_1.prisma.$transaction(async (tx) => {
                // 1. Delete old rows
                await tx.timesheetRow.deleteMany({
                    where: { timesheetId: dbSheet.id },
                });
                // 2. Insert new rows
                for (const row of rows) {
                    await tx.timesheetRow.create({
                        data: {
                            timesheetId: dbSheet.id,
                            client: row.client,
                            project: row.project,
                            task: row.task,
                            billable: row.billable,
                            mon: row.hours[0],
                            tue: row.hours[1],
                            wed: row.hours[2],
                            thu: row.hours[3],
                            fri: row.hours[4],
                            sat: row.hours[5],
                            sun: row.hours[6],
                        },
                    });
                }
                // 3. Keep/update status to Draft
                await tx.timesheet.update({
                    where: { id: dbSheet.id },
                    data: { status: 'Draft' },
                });
            });
            const updatedSheet = await this.getWeeklySheet(weekStart);
            return { success: true, data: updatedSheet };
        }
        catch (err) {
            return { success: false, error: err.message || 'Database error during transaction' };
        }
    }
    /**
     * Submits a timesheet for review.
     */
    static async submitSheet(weekStart, role, rows) {
        const sheet = await this.getWeeklySheet(weekStart);
        // Lock checks
        if (sheet.status === 'Submitted' && role === 'Employee') {
            return { success: false, error: 'Timesheet has already been submitted.' };
        }
        if (sheet.status === 'Approved' && role !== 'Super Admin') {
            return { success: false, error: 'Timesheet is approved and closed. Only Super Admins can override.' };
        }
        // Persist rows and change status to Submitted
        try {
            const dbSheet = await prisma_1.prisma.timesheet.findUnique({
                where: { weekStart },
            });
            if (!dbSheet)
                throw new Error('Timesheet period not initialized.');
            await prisma_1.prisma.$transaction(async (tx) => {
                // Delete old rows
                await tx.timesheetRow.deleteMany({
                    where: { timesheetId: dbSheet.id },
                });
                // Insert new rows
                for (const row of rows) {
                    await tx.timesheetRow.create({
                        data: {
                            timesheetId: dbSheet.id,
                            client: row.client,
                            project: row.project,
                            task: row.task,
                            billable: row.billable,
                            mon: row.hours[0],
                            tue: row.hours[1],
                            wed: row.hours[2],
                            thu: row.hours[3],
                            fri: row.hours[4],
                            sat: row.hours[5],
                            sun: row.hours[6],
                        },
                    });
                }
                // Update status to Submitted
                await tx.timesheet.update({
                    where: { id: dbSheet.id },
                    data: { status: 'Submitted' },
                });
            });
            const updatedSheet = await this.getWeeklySheet(weekStart);
            return { success: true, data: updatedSheet };
        }
        catch (err) {
            return { success: false, error: err.message || 'Database error during transaction' };
        }
    }
    /**
     * Approves or rejects a submitted timesheet.
     */
    static async approveOrRejectSheet(weekStart, role, action) {
        const sheet = await this.getWeeklySheet(weekStart);
        // Permission checks
        if (role === 'Employee') {
            return { success: false, error: 'Employees are not authorized to approve or reject timesheets.' };
        }
        let nextStatus = 'Draft';
        if (action === 'approve') {
            if (sheet.status === 'Approved' && role !== 'Super Admin') {
                return { success: false, error: 'Timesheet is already approved and locked.' };
            }
            nextStatus = 'Approved';
        }
        else {
            if (sheet.status === 'Approved' && role !== 'Super Admin') {
                return { success: false, error: 'Cannot reject an approved timesheet unless you are a Super Admin.' };
            }
            nextStatus = 'Draft';
        }
        try {
            await prisma_1.prisma.timesheet.update({
                where: { weekStart },
                data: { status: nextStatus },
            });
            const updatedSheet = await this.getWeeklySheet(weekStart);
            return { success: true, data: updatedSheet };
        }
        catch (err) {
            return { success: false, error: err.message || 'Database error during status update' };
        }
    }
}
exports.TimesheetService = TimesheetService;
