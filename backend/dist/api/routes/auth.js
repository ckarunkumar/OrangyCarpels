"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authService_1 = require("../../services/authService");
const loginSchema = {
    body: {
        type: 'object',
        required: ['email'],
        properties: {
            email: { type: 'string', format: 'email' },
        },
    },
};
const authRoutes = async (fastify) => {
    // POST login user
    fastify.post('/auth/login', { schema: loginSchema }, async (request, reply) => {
        const { email } = request.body;
        const result = await authService_1.AuthService.login(email);
        if (!result.success || !result.sessionId || !result.session) {
            return reply.status(401).send({ error: result.error || 'Authentication failed.' });
        }
        // Set HTTP-only session cookie
        reply.setCookie('sessionId', result.sessionId, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600 * 24 * 7, // 7 days
        });
        return result.session;
    });
    // POST logout user
    fastify.post('/auth/logout', async (request, reply) => {
        const sessionId = request.cookies.sessionId;
        if (sessionId) {
            authService_1.AuthService.destroySession(sessionId);
            reply.clearCookie('sessionId', { path: '/' });
        }
        return { success: true, message: 'Logged out successfully.' };
    });
    // GET currently logged-in profile context
    fastify.get('/auth/me', async (request, reply) => {
        const sessionId = request.cookies.sessionId;
        if (!sessionId) {
            return reply.status(401).send({ error: 'Unauthorized: No active session.' });
        }
        const session = authService_1.AuthService.getSession(sessionId);
        if (!session) {
            reply.clearCookie('sessionId', { path: '/' });
            return reply.status(401).send({ error: 'Unauthorized: Session expired or invalid.' });
        }
        return session;
    });
};
exports.default = authRoutes;
