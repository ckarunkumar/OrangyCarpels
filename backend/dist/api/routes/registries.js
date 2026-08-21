"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registryService_1 = require("../../services/registryService");
const registrySchema_1 = require("../schemas/registrySchema");
const registryRoutes = async (fastify) => {
    // GET employees list
    fastify.get('/employees', { schema: registrySchema_1.getRegistrySchema }, async (request, reply) => {
        const role = request.user.role;
        try {
            const emps = await registryService_1.RegistryService.getEmployees(role);
            return emps;
        }
        catch (err) {
            return reply.status(403).send({ error: err.message });
        }
    });
    // POST create employee
    fastify.post('/employees', { schema: registrySchema_1.createEmployeeSchema }, async (request, reply) => {
        const employeeData = request.body;
        const role = request.user.role;
        try {
            const newEmp = await registryService_1.RegistryService.createEmployee(role, employeeData);
            return newEmp;
        }
        catch (err) {
            return reply.status(403).send({ error: err.message });
        }
    });
    // GET clients list (with projects)
    fastify.get('/clients', { schema: registrySchema_1.getRegistrySchema }, async (request, reply) => {
        const role = request.user.role;
        try {
            const clients = await registryService_1.RegistryService.getClients(role);
            return clients;
        }
        catch (err) {
            return reply.status(403).send({ error: err.message });
        }
    });
    // POST create client
    fastify.post('/clients', { schema: registrySchema_1.createClientSchema }, async (request, reply) => {
        const { name, billingCurrency } = request.body;
        const role = request.user.role;
        try {
            const newClient = await registryService_1.RegistryService.createClient(role, name, billingCurrency);
            return newClient;
        }
        catch (err) {
            return reply.status(403).send({ error: err.message });
        }
    });
    // POST create project under client
    fastify.post('/projects', { schema: registrySchema_1.createProjectSchema }, async (request, reply) => {
        const { clientId, name, billingType, rate, budgetHours } = request.body;
        const role = request.user.role;
        try {
            const newProj = await registryService_1.RegistryService.createProject(role, clientId, name, billingType, rate, budgetHours);
            return newProj;
        }
        catch (err) {
            return reply.status(403).send({ error: err.message });
        }
    });
};
exports.default = registryRoutes;
