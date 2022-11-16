import { Router } from 'express';
import { createRoomChat } from '../../controller/room/create';
import { getRoom, getRoomDetail } from '../../controller/room/get';
import { addUserToGroup, createGroup } from '../../controller/room/group';
import { searchUserAddRoom } from '../../controller/user';
import { validateUserMiddleware } from '../../middleware/user/validate';
import { validateCreateGroupChat, validateCreateRoomChat } from '../../validator/room/create';

const router = Router();

router.post('/create', validateUserMiddleware, validateCreateRoomChat, createRoomChat);

router.get('/get-rooms', validateUserMiddleware, getRoom);

router.get('/get/:id', validateUserMiddleware, getRoomDetail);

router.post('/create-room', validateUserMiddleware, validateCreateGroupChat, createGroup);

// @ts-ignore
router.get('/invite/users', validateUserMiddleware, searchUserAddRoom);

router.put('/add/:id/:roomId', validateUserMiddleware, addUserToGroup);

export default router;