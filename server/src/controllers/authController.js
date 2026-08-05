import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, toPublicUser, verifyPassword } from '../services/store.js';

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'noticeboard-secret', {
    expiresIn: '7d',
  });
}

export async function register(req, res) {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const user = await createUser({ name, email, password, role, department });
  const token = signToken(user);

  res.status(201).json({
    token,
    user: toPublicUser(user),
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = findUserByEmail(email || '');
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordMatches = await verifyPassword(user, password || '');
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({
    token: signToken(user),
    user: toPublicUser(user),
  });
}

export function me(req, res) {
  res.json({ user: req.user });
}

export function logout(_req, res) {
  res.json({ ok: true });
}
