import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getNotifications, markNotificationsReadHandler } from '../controllers/notificationController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getNotifications);
router.put('/read', markNotificationsReadHandler);

export default router;
