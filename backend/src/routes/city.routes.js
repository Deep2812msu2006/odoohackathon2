import { Router } from 'express';
import * as cityController from '../controllers/city.controller.js';

const router = Router();

router.get('/', cityController.getCities);
router.get('/:id', cityController.getCityById);

export default router;
