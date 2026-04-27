// ---------------------------------------------------------
// User routes (protected)
// ---------------------------------------------------------

import { Router } from 'express';
import { userController } from '../controllers';
import { authenticate, requirePermissions, validate } from '../middlewares';
import { Permission } from '../constants';
import { createUserSchema, updateUserSchema, userIdParamSchema, paginationQuerySchema } from '../validators';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.post('/', requirePermissions(Permission.MANAGE_USERS), validate(createUserSchema), userController.create);
router.get('/', requirePermissions(Permission.MANAGE_USERS), validate(paginationQuerySchema), userController.getAll);
router.get('/:id', requirePermissions(Permission.MANAGE_USERS), validate(userIdParamSchema), userController.getById);
router.put('/:id', requirePermissions(Permission.MANAGE_USERS), validate(updateUserSchema), userController.update);
router.delete('/:id', requirePermissions(Permission.MANAGE_USERS), validate(userIdParamSchema), userController.delete);

export default router;
