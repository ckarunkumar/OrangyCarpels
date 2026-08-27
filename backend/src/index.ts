import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import * as dotenv from 'dotenv';
import timesheetRoutes from './api/routes/timesheets';
import registryRoutes from './api/routes/registries';
import authRoutes from './api/routes/auth';
import billingRoutes from './api/routes/billing';
import notificationRoutes from './api/routes/notifications';
import { businessLineRoutes } from './api/routes/businessLines';
import leaveRoutes from './api/routes/leaves';
import { AuthService, UserSession } from './services/authService';

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserSession;
  }
}

dotenv.config();

const fastify = Fastify({
  logger: true,
});

const start = async () => {
  try {
    // Enable CORS for frontend
    await fastify.register(cors, {
      origin: true, // Will customize this in production
      credentials: true,
    });

    // Register cookie support for session management
    await fastify.register(cookie, {
      secret: process.env.COOKIE_SECRET || 'super-secret-cookie-decryption-key-minimum-32-chars-long',
    });

    // Global Authentication Session Hook
    fastify.addHook('preHandler', async (request, reply) => {
      const url = request.url.split('?')[0]; // strip query parameters
      
      // Allow health check and auth login routes without session
      if (url === '/api/health' || url === '/api/auth/login') {
        return;
      }

      const sessionId = request.cookies.sessionId;
      if (!sessionId) {
        return reply.status(401).send({ error: 'Unauthorized: No active session.' });
      }

      const session = await AuthService.getSession(sessionId);
      if (!session) {
        return reply.status(401).send({ error: 'Unauthorized: Session expired or invalid.' });
      }

      // Attach resolved session context to request context
      request.user = session;
    });

    // Health check endpoint
    fastify.get('/api/health', async () => {
      return { status: 'OK', message: 'Orangyy Carpels Backend API is healthy' };
    });

    // Register timesheet, registry, billing, and auth API routes
    await fastify.register(authRoutes, { prefix: '/api' });
    await fastify.register(timesheetRoutes, { prefix: '/api' });
    await fastify.register(registryRoutes, { prefix: '/api' });
    await fastify.register(billingRoutes, { prefix: '/api' });
    await fastify.register(notificationRoutes, { prefix: '/api' });
    await fastify.register(leaveRoutes, { prefix: '/api' });
    await fastify.register(businessLineRoutes);

    const port = Number(process.env.PORT) || 5001;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`Backend server listening on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
