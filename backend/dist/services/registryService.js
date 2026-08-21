"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryService = void 0;
const prisma_1 = require("../lib/prisma");
class RegistryService {
    /**
     * Returns employees list from database, masking costRate if role is not Super Admin.
     * Throws error if Employee requests it.
     */
    static async getEmployees(role) {
        if (role === 'Employee') {
            throw new Error('Access Denied: Employees cannot view the full registry.');
        }
        const employees = await prisma_1.prisma.employee.findMany({
            include: {
                education: true,
                experience: true,
            },
        });
        return employees.map((emp) => {
            const mapped = {
                id: emp.id,
                fullName: emp.fullName,
                designation: emp.designation,
                department: emp.department,
                email: emp.email,
                phone: emp.phone,
                costRate: role === 'Super Admin' ? emp.costRate : 'RESTRICTED',
                capacity: emp.capacity,
                status: emp.status,
                education: emp.education.map((edu) => ({
                    degree: edu.degree,
                    school: edu.school,
                    year: edu.year,
                })),
                experience: emp.experience.map((exp) => ({
                    company: exp.company,
                    role: exp.role,
                    period: exp.period,
                })),
            };
            return mapped;
        });
    }
    /**
     * Creates a new employee in database. Super Admin only.
     */
    static async createEmployee(role, data) {
        if (role !== 'Super Admin') {
            throw new Error('Access Denied: Only Super Admins can create employee profiles.');
        }
        const emp = await prisma_1.prisma.employee.create({
            data: {
                fullName: data.fullName,
                designation: data.designation,
                department: data.department,
                email: data.email,
                phone: data.phone,
                costRate: data.costRate,
                capacity: data.capacity,
                status: data.status || 'Active',
            },
        });
        return {
            ...emp,
            status: emp.status,
            education: [],
            experience: [],
        };
    }
    /**
     * Returns clients list from database, masking contract rates if role is not Super Admin.
     * Throws error if Employee requests it.
     */
    static async getClients(role) {
        if (role === 'Employee') {
            throw new Error('Access Denied: Employees cannot view client registries.');
        }
        const clients = await prisma_1.prisma.client.findMany({
            include: {
                projects: true,
            },
        });
        return clients.map((client) => {
            const projects = client.projects.map((proj) => ({
                id: proj.id,
                name: proj.name,
                billingType: proj.billingType,
                rate: role === 'Super Admin' ? proj.rate : 'RESTRICTED',
                budgetHours: proj.budgetHours,
                loggedHours: proj.loggedHours,
                status: proj.status,
            }));
            return {
                id: client.id,
                name: client.name,
                billingCurrency: client.billingCurrency,
                status: client.status,
                projects,
            };
        });
    }
    /**
     * Creates a client in database. Super Admin only.
     */
    static async createClient(role, name, billingCurrency) {
        if (role !== 'Super Admin') {
            throw new Error('Access Denied: Only Super Admins can create client entities.');
        }
        const count = await prisma_1.prisma.client.count();
        const client = await prisma_1.prisma.client.create({
            data: {
                id: `CL-00${count + 1}`,
                name,
                billingCurrency,
                status: 'Active',
            },
        });
        return {
            id: client.id,
            name: client.name,
            billingCurrency: client.billingCurrency,
            status: client.status,
            projects: [],
        };
    }
    /**
     * Creates a project under a client in database. PM or Admin.
     */
    static async createProject(role, clientId, name, billingType, rate, budgetHours) {
        if (role === 'Employee') {
            throw new Error('Access Denied: Employees cannot create projects.');
        }
        const client = await prisma_1.prisma.client.findUnique({
            where: { id: clientId },
        });
        if (!client) {
            throw new Error('Client not found.');
        }
        const projId = `PRJ-${Math.floor(100 + Math.random() * 900)}`;
        const proj = await prisma_1.prisma.project.create({
            data: {
                id: projId,
                name,
                billingType,
                rate,
                budgetHours,
                status: 'Active',
                clientId,
            },
        });
        return {
            id: proj.id,
            name: proj.name,
            billingType: proj.billingType,
            rate: proj.rate,
            budgetHours: proj.budgetHours,
            loggedHours: proj.loggedHours,
            status: proj.status,
        };
    }
}
exports.RegistryService = RegistryService;
