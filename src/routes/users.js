import { Router } from 'express';
import controller from '../controllers/users.js';
import validation from '../middlewares/validation.js';

const router = Router();

router.get('/users/:userId', controller.GET);
router.get('/users', controller.GET);
router.post('/register', validation, controller.REGISTER);
router.post('/login', validation, controller.LOGIN);

export default router;
