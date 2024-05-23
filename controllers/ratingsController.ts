import { Request, Response } from 'express';
import db from '../db/db';
import { Query } from './resturantController';

class RatingsController {
  async createRating(req: Request, res: Response) {
    const { restaurantId, rating } = req.body;

    // Validate request body
    if (
      !restaurantId ||
      typeof rating !== 'number' ||
      rating < 0 ||
      rating > 10
    ) {
      return res.status(400).json({
        message:
          'Invalid request body, restaurantId is required and rating must be a number between 0 and 10',
      });
    }
    // Check if the restaurant exists
    const checkQuery: Query = {
      text: 'SELECT * FROM restaurants WHERE id = $1',
      values: [restaurantId],
    };

    const checkResult = await db.query(checkQuery);
    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'Restaurant with this ID does not exist.' });
    }
    const ratingQuery: Query = {
      text: 'INSERT INTO ratings (restaurantId, rating) VALUES ($1, $2) RETURNING *',
      values: [req.body.restaurantId, req.body.rating],
    };
    await db.query(ratingQuery);
    //update average rating in restaurants table
    const avgRatingQuery: Query = {
      text: 'SELECT AVG(rating) FROM ratings WHERE restaurantId = $1',
      values: [req.body.restaurantId],
    };
    const avgRating = await db.query(avgRatingQuery);
    const updateRatingQuery: Query = {
      text: 'UPDATE restaurants SET averageRating = $1 WHERE id = $2',
      values: [avgRating.rows[0].avg, req.body.restaurantId],
    };
    await db.query(updateRatingQuery);
    res.status(200).json({ message: 'Rating created' });
  }
}

export default new RatingsController();
