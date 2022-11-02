import { Router } from 'express';
import { createRoomChat } from '../../controller/room/create';
import { getRoom, getRoomDetail } from '../../controller/room/get';
import { validateUserMiddleware } from '../../middleware/user/validate';
import { validateCreateRoomChat } from '../../validator/room/create';

const router = Router();

router.post('/create', validateUserMiddleware, validateCreateRoomChat, createRoomChat);

router.get('/get-rooms', validateUserMiddleware, getRoom);

router.get('/get/:id', validateUserMiddleware, getRoomDetail);

export default router;