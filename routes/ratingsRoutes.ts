import Router from 'express';
import ratingController from '../controllers/ratingsController';
const router = Router();

router.post('/', ratingController.createRating);

export default router;
