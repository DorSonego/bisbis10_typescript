import { Request, Response } from 'express';
import db from '../db/db';

export type Query = {
  text: string;
  values: any[];
};

class restaurantController {
  getAllRestaurants = async (req: Request, res: Response) => {
    const { cuisine } = req.query;
    let query: Query;

    try {
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
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      res
        .status(500)
        .json({ message: 'An error occurred while fetching restaurants.' });
    }
  };

  getRestaurantById = async (req: Request, res: Response) => {
    // get restaurant by id
    const restaurantQuery: Query = {
      text: 'SELECT * FROM restaurants WHERE id = $1',
      values: [req.params.id],
    };
    // get all dishes by restaurant id
    const dishQuery: Query = {
      text: 'SELECT * FROM dishes WHERE restaurantId = $1',
      values: [req.params.id],
    };

    try {
      const restaurant = await db.query(restaurantQuery);
      const dishes = await db.query(dishQuery);
      if (restaurant.rows.length === 0) {
        return res.status(404).json({ message: 'Restaurant not found.' });
      }
      res.status(200).json({
        ...restaurant.rows[0],
        dishes: dishes.rows,
      });
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      res
        .status(500)
        .json({ message: 'An error occurred while fetching the restaurant.' });
    }
  };
  createRestaurant = async (req: Request, res: Response) => {
    if (
      typeof req.body.name !== 'string' ||
      req.body.name.trim() === '' ||
      typeof req.body.isKosher !== 'boolean' ||
      !Array.isArray(req.body.cuisines) ||
      req.body.cuisines.length === 0
    ) {
      return res.status(400).json({
        message:
          'Missing or invalid required fields: name, isKosher, cuisines.',
      });
    }
    let { name, isKosher, cuisines } = req.body;

    // Normalize the name
    name = name.replace(/\W/g, '').toLowerCase();
    cuisines = cuisines.map((cuisine: string) =>
      cuisine.replace(/\W/g, '').toLowerCase()
    );
    const uniqueCuisines = [...new Set(cuisines)];
    if (uniqueCuisines.length !== cuisines.length) {
      return res
        .status(400)
        .json({ message: 'Duplicate cuisines are not allowed.' });
    }
    cuisines = uniqueCuisines;
    if (!name || isKosher === undefined || !cuisines) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    if (typeof isKosher !== 'boolean') {
      return res.status(400).json({
        message: 'Invalid value for isKosher. It should be a boolean.',
      });
    }

    try {
      // Check if a restaurant with the same name already exists
      const checkQuery: Query = {
        text: "SELECT * FROM restaurants WHERE lower(regexp_replace(name, 'W', '', 'g')) = $1",
        values: [name],
      };
      const checkResult = await db.query(checkQuery);
      if (checkResult.rows.length > 0) {
        return res
          .status(400)
          .json({ message: 'A restaurant with this name already exists.' });
      }

      const query: Query = {
        text: 'INSERT INTO restaurants (name, isKosher, averageRating, cuisines) VALUES ($1, $2, $3, $4) RETURNING *',
        values: [name, isKosher, 0, cuisines],
      };
      const result = await db.query(query);
      res.status(201).json(result.rows);
    } catch (error) {
      console.error('Error creating restaurant:', error);
      res
        .status(500)
        .json({ message: 'An error occurred while creating the restaurant.' });
    }
  };
  updateRestaurant = async (req: Request, res: Response) => {
    const restaurantId = req.params.id;
    let { cuisines } = req.body;

    try {
      // Check if the restaurant exists
      const restaurantQuery: Query = {
        text: 'SELECT * FROM restaurants WHERE id = $1',
        values: [restaurantId],
      };
      const restaurantResult = await db.query(restaurantQuery);
      if (restaurantResult.rows.length === 0) {
        return res.status(404).json({ message: 'Restaurant not found.' });
      }
      // Check if the cuisine already exists in the restaurant
      const existingCuisines = restaurantResult.rows[0].cuisines;

      const normalizedExistingCuisines = existingCuisines.map(
        (cuisine: string) => cuisine.replace(/\s/g, '').toLowerCase()
      );
      const normalizedInputCuisines = cuisines.map((cuisine: string) =>
        cuisine.replace(/\s/g, '').toLowerCase()
      );
      const newCuisines = normalizedInputCuisines.filter(
        (cuisine: string) => !normalizedExistingCuisines.includes(cuisine)
      );
      if (newCuisines.length === 0) {
        return res.status(400).json({ message: 'No new cuisines to add.' });
      }

      // Update the restaurant
      const updateQuery: Query = {
        text: 'UPDATE restaurants SET cuisines = array_cat(cuisines, $1) WHERE id = $2',
        values: [newCuisines, restaurantId],
      };
      await db.query(updateQuery);
      res.status(200).json({ message: 'Restaurant updated successfully.' });
    } catch (error) {
      console.error('Error updating restaurant:', error);
      res
        .status(500)
        .json({ message: 'An error occurred while updating the restaurant.' });
    }
  };

  deleteRestaurant = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
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

      // Delete the restaurant
      const query: Query = {
        text: 'DELETE FROM restaurants WHERE id = $1',
        values: [id],
      };

      //delete all dishes by restaurant id
      await db.query({
        text: 'DELETE FROM dishes WHERE restaurantId = $1',
        values: [id],
      });
      // TODO: delete all orders by restaurant id
      await db.query({
        text: 'DELETE FROM orders WHERE restaurantId = $1',
        values: [id],
      });
      // TODO: delete all ratings by restaurant id
      await db.query({
        text: 'DELETE FROM ratings WHERE restaurantId = $1',
        values: [id],
      });
      await db.query(query);
      res.status(204).json();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      res
        .status(500)
        .json({ message: 'An error occurred while deleting the restaurant.' });
    }
  };
}

export default new restaurantController();
