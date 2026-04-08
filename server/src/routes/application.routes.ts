import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../controllers/application.controller';

const router = Router();

router.use(protect);

router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;
