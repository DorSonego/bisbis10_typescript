import { Router } from 'express';
import dishController from '../controllers/dishesController';
const router = Router({ mergeParams: true });

/**
 * @swagger
 * /dishes:
 *  post:
 *    description: Create a new dish
 *    responses:
 *      '201':
 *        description: Dish created successfully
 *    parameters:
 *      - in: body
 *        name: dish
 *        description: The dish to create
 *        schema:
 *          type: object
 *          required:
 *            - name
 *            - description
 *            - price
 *          properties:
 *            name:
 *              type: string
 *            description:
 *              type: string
 *            price:
 *              type: number
 */
router.post('/', dishController.createDish);

/**
 * @swagger
 * /dishes/{dishId}:
 *  put:
 *    description: Update a dish
 *    responses:
 *      '200':
 *        description: Dish updated successfully
 *    parameters:
 *      - in: path
 *        name: dishId
 *        required: true
 *        type: string
 *        description: The id of the dish to update
 *      - in: body
 *        name: dish
 *        description: The dish details to update
 *        schema:
 *          type: object
 *          properties:
 *            description:
 *              type: string
 *            price:
 *              type: number
 */
router.put('/:dishId', dishController.updateDish);

/**
 * @swagger
 * /dishes/{dishId}:
 *  delete:
 *    description: Delete a dish
 *    responses:
 *      '204':
 *        description: Dish deleted successfully
 *    parameters:
 *      - in: path
 *        name: dishId
 *        required: true
 *        type: string
 *        description: The id of the dish to delete
 */
router.delete('/:dishId', dishController.deleteDish);

/**
 * @swagger
 * /dishes:
 *  get:
 *    description: Get all dishes by restaurant ID
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get('/', dishController.getAllDishesByRestaurantId);

export default router;
