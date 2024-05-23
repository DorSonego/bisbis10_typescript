import { Router } from 'express';
import dishController from '../controllers/dishesController';
const router = Router({ mergeParams: true });

router.post('/', dishController.createDish);
router.put('/:dishId', dishController.updateDish);
router.delete('/:dishId', dishController.deleteDish);
router.get('/', dishController.getAllDishesByRestaurantId);

export default router;
