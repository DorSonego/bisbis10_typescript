import Router from 'express';
import orderController from '../controllers/orderController';
const router = Router();

/**
 * @swagger
 * /orders:
 *  post:
 *    description: Create a new order
 *    responses:
 *      '200':
 *        description: Order created successfully
 *    parameters:
 *      - in: body
 *        name: order
 *        description: The order to create
 *        schema:
 *          type: object
 *          required:
 *            - restaurantId
 *            - orderItems
 *          properties:
 *            restaurantId:
 *              type: string
 *            orderItems:
 *              type: array
 *              items:
 *                type: object
 *                required:
 *                  - dishId
 *                  - amount
 *                properties:
 *                  dishId:
 *                    type: string
 *                  amount:
 *                    type: number
 */
router.post('/', orderController.createOrder);

export default router;
