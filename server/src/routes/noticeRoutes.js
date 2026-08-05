import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { bookmarkNoticeHandler, createNoticeHandler, deleteNoticeHandler, getAllNotices, getBookmarksHandler, getCategoriesHandler, getNotice, publishNoticeHandler, updateNoticeHandler, viewNoticeHandler } from '../controllers/noticeController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getAllNotices);
router.get('/bookmarks', getBookmarksHandler);
router.get('/categories', getCategoriesHandler);
router.get('/:id', getNotice);
router.post('/', requireRole('admin', 'hr', 'faculty'), upload.array('attachments', 5), createNoticeHandler);
router.put('/:id', requireRole('admin', 'hr', 'faculty'), upload.array('attachments', 5), updateNoticeHandler);
router.post('/:id/publish', requireRole('admin', 'hr', 'faculty'), publishNoticeHandler);
router.post('/:id/view', viewNoticeHandler);
router.post('/:id/bookmark', bookmarkNoticeHandler);
router.delete('/:id', requireRole('admin'), deleteNoticeHandler);

export default router;
