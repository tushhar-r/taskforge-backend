// ---------------------------------------------------------
// Task routes (protected)
// ---------------------------------------------------------

import { Router } from 'express';
import { taskController } from '../controllers';
import { authenticate, validate } from '../middlewares';
import { 
  createTaskSchema, 
  updateTaskSchema, 
  taskIdParamSchema, 
  taskFilterQuerySchema 
} from '../validators';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.post('/', validate(createTaskSchema), taskController.create);
router.get('/', validate(taskFilterQuerySchema), taskController.getAll);
router.get('/:id', validate(taskIdParamSchema), taskController.getById);
router.put('/:id', validate(updateTaskSchema), taskController.update);
router.delete('/:id', validate(taskIdParamSchema), taskController.delete);

export default router;
