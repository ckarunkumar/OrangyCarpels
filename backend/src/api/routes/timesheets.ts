import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { TimesheetService } from '../../services/timesheetService';
import {
  getTimesheetSchema,
  saveTimesheetSchema,
  approveTimesheetSchema,
} from '../schemas/timesheetSchema';

const timesheetRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET weekly timesheet
  fastify.get('/timesheets', { schema: getTimesheetSchema }, async (request, reply) => {
    const { weekStart } = request.query as { weekStart: string };
    const sheet = await TimesheetService.getWeeklySheet(weekStart);
    return sheet;
  });

  // POST save draft hours
  fastify.post('/timesheets/save', { schema: saveTimesheetSchema }, async (request, reply) => {
    const { weekStart, rows } = request.body as {
      weekStart: string;
      rows: any[];
    };
    const role = request.user!.role;

    const result = await TimesheetService.saveDraft(weekStart, role, rows);
    if (!result.success) {
      return reply.status(403).send({ error: result.error });
    }
    return result.data;
  });

  // POST submit weekly hours for approval
  fastify.post('/timesheets/submit', { schema: saveTimesheetSchema }, async (request, reply) => {
    const { weekStart, rows } = request.body as {
      weekStart: string;
      rows: any[];
    };
    const role = request.user!.role;

    const result = await TimesheetService.submitSheet(weekStart, role, rows);
    if (!result.success) {
      return reply.status(403).send({ error: result.error });
    }
    return result.data;
  });

  // POST approve or reject weekly hours
  fastify.post('/timesheets/approve', { schema: approveTimesheetSchema }, async (request, reply) => {
    const { weekStart, action } = request.body as {
      weekStart: string;
      action: 'approve' | 'reject';
    };
    const role = request.user!.role;

    const result = await TimesheetService.approveOrRejectSheet(weekStart, role, action);
    if (!result.success) {
      return reply.status(403).send({ error: result.error });
    }
    return result.data;
  });
};

export default timesheetRoutes;
