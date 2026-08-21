"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectSchema = exports.createClientSchema = exports.updateEmployeeSchema = exports.createEmployeeSchema = exports.getRegistrySchema = void 0;
exports.getRegistrySchema = {
    querystring: {
        type: 'object',
        properties: {},
    },
};
exports.createEmployeeSchema = {
    body: {
        type: 'object',
        required: ['fullName', 'designation', 'department', 'email', 'phone', 'costRate', 'capacity'],
        properties: {
            fullName: { type: 'string', minLength: 1 },
            designation: { type: 'string', minLength: 1 },
            department: { type: 'string', minLength: 1 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', minLength: 5 },
            costRate: { type: 'string', minLength: 1 },
            capacity: { type: 'string', minLength: 1 },
        },
    },
};
exports.updateEmployeeSchema = {
    body: {
        type: 'object',
        properties: {
            fullName: { type: 'string' },
            designation: { type: 'string' },
            department: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            costRate: { type: 'string' },
            capacity: { type: 'string' },
        },
    },
};
exports.createClientSchema = {
    body: {
        type: 'object',
        required: ['name', 'billingCurrency'],
        properties: {
            name: { type: 'string', minLength: 1 },
            billingCurrency: { type: 'string', minLength: 1 },
        },
    },
};
exports.createProjectSchema = {
    body: {
        type: 'object',
        required: ['clientId', 'name', 'billingType', 'rate', 'budgetHours'],
        properties: {
            clientId: { type: 'string', minLength: 1 },
            name: { type: 'string', minLength: 1 },
            billingType: { type: 'string', enum: ['Hourly Rate (T&M)', 'Monthly Resource Cost (Fixed)', 'Project Cost (Fixed)'] },
            rate: { type: 'string', minLength: 1 },
            budgetHours: { type: 'number', minimum: 1 },
        },
    },
};
