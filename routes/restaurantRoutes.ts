import { Router } from 'express';
import restaurantController from '../controllers/resturantController';
import DishRouter from '../routes/dishesRoutes';
const router = Router();
router.use('/:id/dishes', DishRouter);

/**
 * @swagger
 * /restaurants:
 *  get:
 *    description: Get all restaurants
 *    responses:
 *      '200':
 *        description: A list of restaurants
 */
router.get('/', restaurantController.getAllRestaurants);

/**
 * @swagger
 * /restaurants/{id}:
 *  get:
 *    description: Get a restaurant by its ID
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: Numeric ID of the restaurant to get
 *        schema:
 *          type: integer
 *    responses:
 *      '200':
 *        description: A restaurant object
 *      '404':
 *        description: Restaurant not found
 */
router.get('/:id', restaurantController.getRestaurantById);

/**
 * @swagger
 * /restaurants:
 *  post:
 *    description: Create a new restaurant
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              isKosher:
 *                type: boolean
 *              cuisines:
 *                type: array
 *                items:
 *                  type: string
 *    responses:
 *      '201':
 *        description: The created restaurant object
 *      '400':
 *        description: Bad request
 */
router.post('/', restaurantController.createRestaurant);

/**
 * @swagger
 * /restaurants/{id}:
 *  put:
 *    description: Update a restaurant
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: Numeric ID of the restaurant to update
 *        schema:
 *          type: integer
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              cuisines:
 *                type: array
 *                items:
 *                  type: string
 *    responses:
 *      '200':
 *        description: The updated restaurant object
 *      '400':
 *        description: Bad request
 *      '404':
 *        description: Restaurant not found
 */
router.put('/:id', restaurantController.updateRestaurant);

/**
 * @swagger
 * /restaurants/{id}:
 *  delete:
 *    description: Delete a restaurant
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: Numeric ID of the restaurant to delete
 *        schema:
 *          type: integer
 *    responses:
 *      '204':
 *        description: Successfully deleted
 *      '404':
 *        description: Restaurant not found
 */
router.delete('/:id', restaurantController.deleteRestaurant);

export default router;
