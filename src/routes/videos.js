import { Router } from 'express';
import controller from '../controllers/videos.js';
import checkToken from '../middlewares/checkToken.js';

const router = Router();

router.get('/videos', controller.GET);
router.get('/admin/videos', checkToken, controller.GET);
router.post('/admin/videos', checkToken, controller.POST);
router.put('/admin/videos/:videoId', checkToken, controller.PUT);
router.delete('/admin/videos/:videoId', checkToken, controller.DELETE);
router.get('/download/:fileName', controller.DOWNLOAD);

export default router;
