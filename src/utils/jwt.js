export function signAccessToken(app, payload) {
  // exp curto (ex.: 15m) 
  return app.jwt.sign(payload, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
}

export function signRefreshToken(app, payload) {
  return app.jwt.sign(payload, {
    expiresIn: process.env.REFRESH_EXPIRES_IN || '7d'
  });
}