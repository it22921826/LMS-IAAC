import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'iaac_admin_token';

function getJwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_JWT_SECRET (or JWT_SECRET) must be set in production');
  }

  return 'dev_only_change_me';
}

export function signAdminToken(payload, options = {}) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d', ...options });
}

export function verifyAdminToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = verifyAdminToken(token);
    req.adminAuth = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export function getEffectiveAdminRole(adminAuth) {
  const role = adminAuth?.role ? String(adminAuth.role) : '';
  // Backward-compat: existing tokens/admin docs had no role, treat as superadmin.
  if (!role) return 'superadmin';
  return role;
}

export function requireAdminRole(roles) {
  const allowed = Array.isArray(roles) ? roles.map(String) : [String(roles)];
  return (req, res, next) => {
    const role = getEffectiveAdminRole(req.adminAuth);
    if (!allowed.includes(role)) return res.status(403).json({ message: 'Forbidden' });
    return next();
  };
}

export function requireAdminForAppDataKey(options = {}) {
  void options;
  return (req, res, next) => {
    const role = getEffectiveAdminRole(req.adminAuth);
    const key = String(req.params?.key || '');

    if (role === 'superadmin') return next();

    // Staff: only allowed to read/write schedule data.
    if (role === 'staff') {
      if (key === 'schedule') return next();
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.status(403).json({ message: 'Forbidden' });
  };
}

export function setAdminCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAdminCookie(res) {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
}
