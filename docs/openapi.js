export async function registerDocs(app) {
  // Schemas reutilizáveis
  app.addSchema({
    $id: 'User',
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string', enum: ['user', 'admin'] }
    }
  });

  app.addSchema({
    $id: 'AuthTokens',
    type: 'object',
    properties: {
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' }
    }
  });

  app.addSchema({
    $id: 'AuthResponse',
    type: 'object',
    properties: {
      user: { $ref: 'User#' },
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' }
    }
  });

  app.addSchema({
    $id: 'Task',
    type: 'object',
    properties: {
      id: { type: 'integer' },
      user_id: { type: 'integer' },
      title: { type: 'string' },
      description: { type: 'string', nullable: true },
      status: { type: 'string', enum: ['pending', 'in_progress', 'done'] },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    }
  });
}
