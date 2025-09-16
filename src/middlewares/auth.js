export default async function authPlugin(app) {
  app.decorate('authenticate', async function (req, reply) {
    try {
      await req.jwtVerify(); // popula req.user com payload do token
    } catch {
      return reply.code(401).send({ error: 'unauthorized' });
    }
  });
}
