import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { parseJD } from '../controllers/ai.controller';

const router = Router();

router.use(protect);
router.post('/parse', parseJD);

export default router;
