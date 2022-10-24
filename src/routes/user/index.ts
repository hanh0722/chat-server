import { Router } from "express";
import { getInfoUser, loginController, registerController, validateUserController } from "../../controller/user";
import { getTokenMiddleware } from "../../middleware/user/get-token";
import { loginValidator, registerValidator, validateUserOTP } from "../../validator/user/auth";

const router = Router();

router.post('/login', loginValidator, loginController);

router.post('/register', registerValidator, registerController);

router.post('/validate', validateUserOTP, validateUserController);

router.get('/info', getTokenMiddleware, getInfoUser);

export default router;
