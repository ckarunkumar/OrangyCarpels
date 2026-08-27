"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessLineRoutes = businessLineRoutes;
const businessLineService_1 = require("../../services/businessLineService");
async function businessLineRoutes(fastify) {
    // 1. Get all business lines and services
    fastify.get('/api/settings/business-lines', async (request, reply) => {
        try {
            const data = await businessLineService_1.BusinessLineService.getAll();
            return reply.send(data);
        }
        catch (err) {
            return reply.status(500).send({ error: err.message });
        }
    });
    // 2. Create a Business Line (Super Admin only)
    fastify.post('/api/settings/business-lines', async (request, reply) => {
        try {
            const user = request.user || { role: 'Super Admin' };
            const { name, description } = request.body || {};
            const bl = await businessLineService_1.BusinessLineService.createBusinessLine(user.role, name, description);
            return reply.status(201).send(bl);
        }
        catch (err) {
            return reply.status(400).send({ error: err.message });
        }
    });
    // 3. Update a Business Line
    fastify.put('/api/settings/business-lines/:id', async (request, reply) => {
        try {
            const user = request.user || { role: 'Super Admin' };
            const id = parseInt(request.params.id, 10);
            const { name, description, status } = request.body || {};
            const bl = await businessLineService_1.BusinessLineService.updateBusinessLine(user.role, id, name, description, status);
            return reply.send(bl);
        }
        catch (err) {
            return reply.status(400).send({ error: err.message });
        }
    });
    // 4. Delete a Business Line
    fastify.delete('/api/settings/business-lines/:id', async (request, reply) => {
        try {
            const user = request.user || { role: 'Super Admin' };
            const id = parseInt(request.params.id, 10);
            const res = await businessLineService_1.BusinessLineService.deleteBusinessLine(user.role, id);
            return reply.send(res);
        }
        catch (err) {
            return reply.status(400).send({ error: err.message });
        }
    });
    // 5. Create a Service under Business Line
    fastify.post('/api/settings/services', async (request, reply) => {
        try {
            const user = request.user || { role: 'Super Admin' };
            const { businessLineId, name } = request.body || {};
            const s = await businessLineService_1.BusinessLineService.createService(user.role, Number(businessLineId), name);
            return reply.status(201).send(s);
        }
        catch (err) {
            return reply.status(400).send({ error: err.message });
        }
    });
    // 6. Update a Service
    fastify.put('/api/settings/services/:id', async (request, reply) => {
        try {
            const user = request.user || { role: 'Super Admin' };
            const id = parseInt(request.params.id, 10);
            const { name, status } = request.body || {};
            const s = await businessLineService_1.BusinessLineService.updateService(user.role, id, name, status);
            return reply.send(s);
        }
        catch (err) {
            return reply.status(400).send({ error: err.message });
        }
    });
    // 7. Delete a Service
    fastify.delete('/api/settings/services/:id', async (request, reply) => {
        try {
            const user = request.user || { role: 'Super Admin' };
            const id = parseInt(request.params.id, 10);
            const res = await businessLineService_1.BusinessLineService.deleteService(user.role, id);
            return reply.send(res);
        }
        catch (err) {
            return reply.status(400).send({ error: err.message });
        }
    });
}
