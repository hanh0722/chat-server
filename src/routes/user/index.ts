import { Router } from "express";
import { registerController } from "../../controller/user";
import { registerValidator } from "../../validator/user/auth";

const router = Router();

router.post('/register', registerValidator, registerController);

export default router;
