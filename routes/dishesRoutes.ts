import Router from 'express';
import dishController from '../controllers/dishesController';
const router = Router();

router.post('/', dishController.createDish);
router.put('/:id', dishController.updateDish);
router.delete('/:id', dishController.deleteDish);
router.get('/', dishController.getAllDishesByRestaurantId);

export default router;
