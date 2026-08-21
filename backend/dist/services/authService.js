"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../lib/prisma");
// In-memory session datastore (Phase F mockup, simple and robust)
const sessionStore = {};
class AuthService {
    /**
     * Logs in a user by email, verifying profile exists in SQLite database.
     */
    static async login(email) {
        const cleanEmail = email.toLowerCase().trim();
        const employee = await prisma_1.prisma.employee.findUnique({
            where: { email: cleanEmail },
        });
        if (!employee) {
            return { success: false, error: 'Unauthorized: No employee profile registered with this email.' };
        }
        // Generate random 32-character hex session token
        const sessionId = require('crypto').randomBytes(16).toString('hex');
        const session = {
            userId: employee.id,
            email: employee.email,
            role: employee.fullName === 'Nikhil Sen' ? 'Super Admin' : employee.designation.includes('Manager') || employee.fullName === 'Sarah Jenkins' ? 'Project Manager' : 'Employee', // Deriving role strictly based on user parameters or designations
            fullName: employee.fullName,
        };
        // Store in-memory session
        sessionStore[sessionId] = session;
        return { success: true, sessionId, session };
    }
    /**
     * Retrieves active session by ID.
     */
    static getSession(sessionId) {
        return sessionStore[sessionId] || null;
    }
    /**
     * Destroys active session.
     */
    static destroySession(sessionId) {
        if (sessionStore[sessionId]) {
            delete sessionStore[sessionId];
            return true;
        }
        return false;
    }
}
exports.AuthService = AuthService;
