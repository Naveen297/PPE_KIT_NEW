import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.get('/:id', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.post('/', authorize('supervisor', 'admin'), (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.put('/:id', authorize('supervisor', 'admin'), (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.put('/:id/assign', authorize('supervisor', 'admin'), (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.put('/:id/resolve', authorize('supervisor', 'admin'), (req, res) => res.status(501).json({ message: 'Not implemented yet' }));

export default router;
