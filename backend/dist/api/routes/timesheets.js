"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timesheetService_1 = require("../../services/timesheetService");
const timesheetSchema_1 = require("../schemas/timesheetSchema");
const timesheetRoutes = async (fastify) => {
    // GET weekly timesheet
    fastify.get('/timesheets', { schema: timesheetSchema_1.getTimesheetSchema }, async (request, reply) => {
        const { weekStart } = request.query;
        const sheet = await timesheetService_1.TimesheetService.getWeeklySheet(weekStart);
        return sheet;
    });
    // POST save draft hours
    fastify.post('/timesheets/save', { schema: timesheetSchema_1.saveTimesheetSchema }, async (request, reply) => {
        const { weekStart, rows } = request.body;
        const role = request.user.role;
        const result = await timesheetService_1.TimesheetService.saveDraft(weekStart, role, rows);
        if (!result.success) {
            return reply.status(403).send({ error: result.error });
        }
        return result.data;
    });
    // POST submit weekly hours for approval
    fastify.post('/timesheets/submit', { schema: timesheetSchema_1.saveTimesheetSchema }, async (request, reply) => {
        const { weekStart, rows } = request.body;
        const role = request.user.role;
        const result = await timesheetService_1.TimesheetService.submitSheet(weekStart, role, rows);
        if (!result.success) {
            return reply.status(403).send({ error: result.error });
        }
        return result.data;
    });
    // POST approve or reject weekly hours
    fastify.post('/timesheets/approve', { schema: timesheetSchema_1.approveTimesheetSchema }, async (request, reply) => {
        const { weekStart, action } = request.body;
        const role = request.user.role;
        const result = await timesheetService_1.TimesheetService.approveOrRejectSheet(weekStart, role, action);
        if (!result.success) {
            return reply.status(403).send({ error: result.error });
        }
        return result.data;
    });
};
exports.default = timesheetRoutes;
