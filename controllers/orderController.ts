import { Request, Response } from 'express';
import db from '../db/db';
import { Query } from './resturantController';

class orderController {
  async createOrder(req: Request, res: Response) {
    try {
      const { restaurantId, orderItems } = req.body;

      // Validate request body
      if (!restaurantId || !orderItems || !Array.isArray(orderItems)) {
        return res.status(400).json({
          message: 'Invalid request body',
        });
      }

      // Check if orderItems is a valid JSONB object and each orderItem has dishId and amount
      let isOrderItemsValid = true;
      try {
        orderItems.forEach((item: any) => {
          if (typeof item.amount !== 'number' || !item.dishId) {
            isOrderItemsValid = false;
          }
        });
        JSON.parse(JSON.stringify(orderItems));
      } catch (error) {
        isOrderItemsValid = false;
      }
      if (!isOrderItemsValid) {
        return res.status(400).json({
          message:
            'orderItems must be a valid JSONB object and each orderItem must have dishId and amount',
        });
      }

      // Check if the restaurant exists
      const restaurantQuery: Query = {
        text: 'SELECT * FROM restaurants WHERE id = $1',
        values: [restaurantId],
      };
      const restaurantResult = await db.query(restaurantQuery);
      if (restaurantResult.rows.length === 0) {
        return res.status(404).json({
          message: 'Restaurant not found',
        });
      }

      // Check if the restaurant has the order items dishes in the database
      const dishesQuery: Query = {
        text: 'SELECT * FROM dishes WHERE restaurantId = $1',
        values: [restaurantId],
      };
      const restaurantDishes = await db.query(dishesQuery);
      const restaurantDishIds = restaurantDishes.rows.map((dish) => dish.id);
      const orderItemsIds = orderItems.map((item: any) => item.dishId);
      const isOrderValid = orderItemsIds.every((id: number) =>
        restaurantDishIds.includes(id)
      );
      if (!isOrderValid) {
        return res.status(400).json({
          message: 'Invalid order items',
        });
      }

      // Insert the order into the database
      const orderQuery: Query = {
        text: 'INSERT INTO orders (restaurantId, orderItems) VALUES ($1, $2) RETURNING id',
        values: [restaurantId, JSON.stringify(orderItems)],
      };
      const result = await db.query(orderQuery);

      res.status(200).json({
        orderId: result.rows[0].id,
      });
    } catch (error) {
      // Handle unexpected errors
      console.error(error);
      res.status(500).json({
        message: 'An unexpected error occurred',
      });
    }
  }
}

export default new orderController();
