import { Request, Response } from 'express';
import db from '../db/db';

export type Query = {
  text: string;
  values: any[];
};
class orderController {
  async createOrder(req: Request, res: Response) {
    const restaurant = req.body.restaurantId;
    const query: Query = {
      text: 'SELECT * FROM restaurants WHERE id = $1',
      values: [restaurant],
    };
    const resDishes = await db.query(query);
    if (resDishes.rows.length === 0) {
      return res.status(404).json({ message: 'Restaurant Not Found' });
    }
    const dishes = req.body.dishes;
    const dishQuery: Query = {
      text: 'SELECT * FROM dishes WHERE id = ANY($1)',
      values: [dishes],
    };
    const resDish = await db.query(dishQuery);
    if (resDish.rows.length !== dishes.length) {
      return res.status(404).json({ message: 'Dish Not Found' });
    }
    let total = 0;
    resDish.rows.forEach((dish: { price: number }) => {
      total += dish.price;
    });
    const orderQuery: Query = {
      text: 'INSERT INTO orders (restaurantId, dishes, total) VALUES ($1, $2, $3) RETURNING *',
      values: [restaurant, dishes, total],
    };
    await db.query(orderQuery);
    res.status(200).json({ message: 'Order Created' });
  }
}

export default new orderController();
