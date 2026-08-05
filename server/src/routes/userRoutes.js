import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { deleteUser, getUsers, updateUser } from '../controllers/userController.js';

const router = Router();

router.use(requireAuth);
router.get('/', requireRole('admin'), getUsers);
router.put('/:id', requireRole('admin'), updateUser);
router.delete('/:id', requireRole('admin'), deleteUser);

export default router;
