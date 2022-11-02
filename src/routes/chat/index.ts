import {Router} from 'express';
import { getChat } from '../../controller/chat';
import { validateUserMiddleware } from '../../middleware/user/validate';

const router = Router();

router.get('/get/:roomId', validateUserMiddleware, getChat);

export default router;
