import { Request, Response } from 'express';
import db from '../db/db';

export type Query = {
  text: string;
  values: any[];
};

class dishController {
  async createDish(req: Request, res: Response) {
    //check if the restaurant exists
    const { restaurantId } = req.body;
    const checkQuery: Query = {
      text: 'SELECT * FROM restaurants WHERE id = $1',
      values: [restaurantId],
    };
    //check if the dish already exists
    //create a dish

    const { id } = req.params;
    const { name, description, price } = req.body;
  }
  async updateDish(req: Request, res: Response) {}
  async deleteDish(req: Request, res: Response) {}
  async getAllDishesByRestaurantId(req: Request, res: Response) {}
}
export default new dishController();
