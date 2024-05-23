import Router from 'express';
import ratingController from '../controllers/ratingsController';
const router = Router();

/**
 * @swagger
 * /ratings:
 *  post:
 *    description: Create a new rating
 *    responses:
 *      '200':
 *        description: Rating created successfully
 *    parameters:
 *      - in: body
 *        name: rating
 *        description: The rating to create
 *        schema:
 *          type: object
 *          required:
 *            - restaurantId
 *            - rating
 *          properties:
 *            restaurantId:
 *              type: string
 *            rating:
 *              type: number
 *              minimum: 0
 *              maximum: 10
 */
router.post('/', ratingController.createRating);

export default router;
