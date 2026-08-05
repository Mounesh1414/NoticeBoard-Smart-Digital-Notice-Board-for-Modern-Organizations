import { findUserById, listUsers, toPublicUser } from '../services/store.js';

export function getUsers(req, res) {
  res.json({ users: listUsers() });
}

export function updateUser(req, res) {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (req.body.name) user.name = req.body.name;
  if (req.body.department) user.department = req.body.department;
  if (req.body.role) user.role = req.body.role;

  res.json({ user: toPublicUser(user) });
}

export function deleteUser(req, res) {
  res.status(501).json({ message: 'Delete user is not implemented in demo mode' });
}
