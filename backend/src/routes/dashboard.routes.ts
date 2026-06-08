import { Router } from 'express';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.get('/charts/compliance', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.get('/charts/incidents', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.get('/charts/zones', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));

export default router;
