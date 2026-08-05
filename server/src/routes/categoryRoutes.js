import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getCategoriesHandler } from '../controllers/noticeController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getCategoriesHandler);

export default router;
