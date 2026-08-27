import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BusinessLineService } from '../../services/businessLineService';

export async function businessLineRoutes(fastify: FastifyInstance) {
  // 1. Get all business lines and services
  fastify.get('/api/settings/business-lines', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await BusinessLineService.getAll();
      return reply.send(data);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // 2. Create a Business Line (Super Admin only)
  fastify.post('/api/settings/business-lines', async (request: FastifyRequest<{ Body: { name: string; description?: string } }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user || { role: 'Super Admin' };
      const { name, description } = request.body || {};
      const bl = await BusinessLineService.createBusinessLine(user.role, name, description);
      return reply.status(201).send(bl);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // 3. Update a Business Line
  fastify.put('/api/settings/business-lines/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: { name?: string; description?: string; status?: string } }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user || { role: 'Super Admin' };
      const id = parseInt(request.params.id, 10);
      const { name, description, status } = request.body || {};
      const bl = await BusinessLineService.updateBusinessLine(user.role, id, name, description, status);
      return reply.send(bl);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // 4. Delete a Business Line
  fastify.delete('/api/settings/business-lines/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user || { role: 'Super Admin' };
      const id = parseInt(request.params.id, 10);
      const res = await BusinessLineService.deleteBusinessLine(user.role, id);
      return reply.send(res);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // 5. Create a Service under Business Line
  fastify.post('/api/settings/services', async (request: FastifyRequest<{ Body: { businessLineId: number; name: string } }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user || { role: 'Super Admin' };
      const { businessLineId, name } = request.body || {};
      const s = await BusinessLineService.createService(user.role, Number(businessLineId), name);
      return reply.status(201).send(s);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // 6. Update a Service
  fastify.put('/api/settings/services/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: { name?: string; status?: string } }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user || { role: 'Super Admin' };
      const id = parseInt(request.params.id, 10);
      const { name, status } = request.body || {};
      const s = await BusinessLineService.updateService(user.role, id, name, status);
      return reply.send(s);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // 7. Delete a Service
  fastify.delete('/api/settings/services/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user || { role: 'Super Admin' };
      const id = parseInt(request.params.id, 10);
      const res = await BusinessLineService.deleteService(user.role, id);
      return reply.send(res);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
