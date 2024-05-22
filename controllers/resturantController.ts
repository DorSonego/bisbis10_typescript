import { Request, Response } from 'express';
import db from '../db/db';

export type Query = {
  text: string;
  values: any[];
};

class restaurantController {
  getAllRestaurants = async (req: Request, res: Response) => {
    console.log(req.query);
    const { cuisine } = req.query;
    let query: Query;

    if (cuisine) {
      query = {
        text: 'SELECT * FROM restaurants WHERE EXISTS (SELECT 1 FROM UNNEST(cuisines) AS cuisine WHERE cuisine ILIKE $1)',
        values: [cuisine],
      };
    } else {
      query = {
        text: 'SELECT * FROM restaurants',
        values: [],
      };
    }

    const result = await db.query(query);
    console.log(result.rows);
    res.status(200).json(result.rows);
  };
  getRestaurantById = async (req: Request, res: Response) => {
    const query: Query = {
      text: 'SELECT * FROM restaurants WHERE id = $1',
      values: [req.params.id],
    };
    const result = await db.query(query);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not Found' });
    }
    // get all dishes by restaurant id
    //TODO get all orders by restaurant id
    res.status(200).json(result.rows);
  };
  createRestaurant = async (req: Request, res: Response) => {
    const { name } = req.body;

    // Check if a restaurant with the same name already exists
    const checkQuery: Query = {
      text: `SELECT * FROM restaurants WHERE lower(replace(name, '''', '')) = lower(replace($1, '''', ''))`,
      values: [name],
    };
    const checkResult = await db.query(checkQuery);
    if (checkResult.rows.length > 0) {
      return res
        .status(400)
        .json({ message: 'A restaurant with this name already exists.' });
    }
    const query: Query = {
      text: 'INSERT INTO restaurants (name,isKosher,averageRating,cuisines) VALUES ($1, $2, $3 ,$4) RETURNING *',
      values: [req.body.name, req.body.isKosher, 0, req.body.cuisines],
    };
    await db.query(query).then((result) => {
      res.status(201).json(result.rows);
    });
  };
  updateRestaurant = async (req: Request, res: Response) => {
    // check if restaurant exists
    const restaurantQuery: Query = {
      text: 'SELECT * FROM restaurants WHERE id = $1',
      values: [req.params.id],
    };
    const r = await db.query(restaurantQuery);
    if (r.rows.length === 0) {
      return res.status(404).json({ message: 'Resaurant Not Found' });
    }
    /// update restaurant
    const { cuisines } = req.body;
    const updateQuery: Query = {
      text: `UPDATE restaurants SET 
      cuisines = COALESCE($1, cuisines)
             WHERE id = $2`,
      values: [cuisines, req.params.id],
    };
    await db.query(updateQuery);
    res.status(200).json({ message: 'Restaurant Updated' });
  };
  deleteRestaurant = async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if the restaurant exists
    const checkQuery: Query = {
      text: 'SELECT * FROM restaurants WHERE id = $1',
      values: [id],
    };
    const checkResult = await db.query(checkQuery);
    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'Restaurant with this ID does not exist.' });
    }
    const query: Query = {
      text: 'DELETE FROM restaurants WHERE id = $1',
      values: [req.params.id],
    };
    await db.query(query);
    res.status(204).json({ message: 'Restaurant Deleted' });

    //TODO: delete all dishes by restaurant id
    // TODO: delete all orders by restaurant id
    // TODO: delete all ratings by restaurant id
  };
}
export default new restaurantController();
