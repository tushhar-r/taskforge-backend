// ---------------------------------------------------------
// Role routes
// ---------------------------------------------------------

import { Router } from 'express';
import { roleController } from '../controllers';
import { authenticate, requirePermissions, validate } from '../middlewares';
import { Permission } from '../constants';
import {
  createRoleSchema,
  updateRoleSchema,
  roleIdParamSchema,
  paginationQuerySchema,
} from '../validators';

const router = Router();

router.use(authenticate);

// Only users with MANAGE_ROLES can interact with these routes
router.post('/', requirePermissions(Permission.MANAGE_ROLES), validate(createRoleSchema), roleController.create);
router.get('/', requirePermissions(Permission.MANAGE_ROLES), validate(paginationQuerySchema), roleController.getAll);
router.get('/:id', requirePermissions(Permission.MANAGE_ROLES), validate(roleIdParamSchema), roleController.getById);
router.put('/:id', requirePermissions(Permission.MANAGE_ROLES), validate(updateRoleSchema), roleController.update);
router.delete('/:id', requirePermissions(Permission.MANAGE_ROLES), validate(roleIdParamSchema), roleController.delete);

export default router;
