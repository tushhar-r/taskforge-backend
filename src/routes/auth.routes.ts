// ---------------------------------------------------------
// Auth routes
// ---------------------------------------------------------

import { Router } from 'express';
import { authController } from '../controllers';
import { validate } from '../middlewares';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

export default router;
