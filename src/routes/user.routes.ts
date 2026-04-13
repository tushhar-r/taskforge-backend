// ---------------------------------------------------------
// User routes (protected)
// ---------------------------------------------------------

import { Router } from 'express';
import { userController } from '../controllers';
import { authenticate, validate } from '../middlewares';
import { updateUserSchema, userIdParamSchema, paginationQuerySchema } from '../validators';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/', validate(paginationQuerySchema), userController.getAll);
router.get('/:id', validate(userIdParamSchema), userController.getById);
router.put('/:id', validate(updateUserSchema), userController.update);
router.delete('/:id', validate(userIdParamSchema), userController.delete);

export default router;
