export function requireRole(...roles) {
  return async function (req, reply) {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return reply.code(403).send({ error: 'forbidden' });
    }
  };
}
