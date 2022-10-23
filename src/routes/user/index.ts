import { Router } from "express";
import { registerController, validateUserController } from "../../controller/user";
import { registerValidator, validateUserOTP } from "../../validator/user/auth";

const router = Router();

router.post('/register', registerValidator, registerController);


router.post('/validate', validateUserOTP, validateUserController);
export default router;
