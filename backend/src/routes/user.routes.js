import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { updateUserSchema, changePasswordSchema } from '../validators/user.validator.js';

const router = Router();

router.use(protect);

router.get('/me', (req, res) => res.json({ success: true, data: { user: req.user } }));
router.patch('/me', upload.single('profilePhoto'), validate(updateUserSchema), userController.updateProfile);
router.patch('/me/password', validate(changePasswordSchema), userController.changePassword);
router.delete('/me', userController.deleteAccount);

export default router;
