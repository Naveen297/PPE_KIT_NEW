import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin'), (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.get('/:id', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.put('/:id', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.delete('/:id', authorize('admin'), (req, res) => res.status(501).json({ message: 'Not implemented yet' }));

export default router;
