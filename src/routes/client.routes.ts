// ---------------------------------------------------------
// Client routes
// ---------------------------------------------------------

import { Router } from 'express';
import { clientController } from '../controllers';
import { authenticate, requirePermissions, validate } from '../middlewares';
import { Permission } from '../constants';
import {
  createClientSchema,
  updateClientSchema,
  clientIdParamSchema,
  paginationQuerySchema,
} from '../validators';

const router = Router();

router.use(authenticate);

// Granular checks
router.post('/', requirePermissions(Permission.CLIENT_WRITE), validate(createClientSchema), clientController.create);
router.get('/', requirePermissions(Permission.CLIENT_READ), validate(paginationQuerySchema), clientController.getAll);
router.get('/:id', requirePermissions(Permission.CLIENT_READ), validate(clientIdParamSchema), clientController.getById);
router.put('/:id', requirePermissions(Permission.CLIENT_WRITE), validate(updateClientSchema), clientController.update);
router.delete('/:id', requirePermissions(Permission.CLIENT_WRITE), validate(clientIdParamSchema), clientController.delete);

export default router;
