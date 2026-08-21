import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { AuthService } from '../../services/authService';

const loginSchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
    },
  },
};

const updateProfileSchema = {
  body: {
    type: 'object',
    properties: {
      phone: { type: 'string' },
      location: { type: 'string' },
      avatar: { type: ['string', 'null'] },
    },
  },
};

const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // POST login user
  fastify.post('/auth/login', { schema: loginSchema }, async (request, reply) => {
    const { email } = request.body as { email: string };
    const result = await AuthService.login(email);

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
      AuthService.destroySession(sessionId);
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

    const session = await AuthService.getSession(sessionId);
    if (!session) {
      reply.clearCookie('sessionId', { path: '/' });
      return reply.status(401).send({ error: 'Unauthorized: Session expired or invalid.' });
    }

    return session;
  });

  // PUT update currently logged-in user profile
  fastify.put('/auth/profile', { schema: updateProfileSchema }, async (request, reply) => {
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      return reply.status(401).send({ error: 'Unauthorized: No active session.' });
    }

    const session = await AuthService.getSession(sessionId);
    if (!session) {
      reply.clearCookie('sessionId', { path: '/' });
      return reply.status(401).send({ error: 'Unauthorized: Session expired or invalid.' });
    }

    const { phone, location, avatar } = request.body as { phone?: string; location?: string; avatar?: string | null };
    try {
      const updated = await AuthService.updateProfile(session.userId, { phone, location, avatar });
      return updated;
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Failed to update profile.' });
    }
  });
};

export default authRoutes;
