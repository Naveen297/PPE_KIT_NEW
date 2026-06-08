import { Router } from 'express';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.get('/:id', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.put('/:id/acknowledge', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.put('/:id/dismiss', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));

export default router;
