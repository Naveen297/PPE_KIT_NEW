import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.get('/:id', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.post('/generate', authorize('supervisor', 'admin', 'auditor'), (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.get('/:id/download', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));

export default router;
