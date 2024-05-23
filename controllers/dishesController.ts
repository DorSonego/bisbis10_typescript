import { Request, Response } from 'express';
import db from '../db/db';
import { Query } from './resturantController';

class dishController {
  async createDish(req: Request, res: Response) {
    const restaurantId = req.params.id;
    let { name, description, price } = req.body;

    // Remove all whitespace from name
    name = name.replace(/\s/g, '');

    if (!name || !description || !price) {
      return res
        .status(400)
        .json({ message: 'Name, description, and price are required.' });
    }

    // Check if name and description are strings and price is a number
    if (
      typeof name !== 'string' ||
      typeof description !== 'string' ||
      typeof price !== 'number'
    ) {
      return res.status(400).json({
        message:
          'Name and description must be strings, and price must be a number.',
      });
    }

    try {
      // Check if the restaurant exists
      const checkRestaurantQuery: Query = {
        text: 'SELECT * FROM restaurants WHERE id = $1',
        values: [restaurantId],
      };
      const restaurantResult = await db.query(checkRestaurantQuery);
      if (restaurantResult.rows.length === 0) {
        return res
          .status(404)
          .json({ message: 'Restaurant with this ID does not exist.' });
      }

      // Check if the dish already exists
      const checkDishQuery: Query = {
        text: "SELECT * FROM dishes WHERE REPLACE(name, ' ', '') = $1 AND restaurantId = $2",
        values: [name, restaurantId],
      };
      const dishResult = await db.query(checkDishQuery);
      if (dishResult.rows.length > 0) {
        return res.status(400).json({
          message: 'Dish with this name already exists for this restaurant.',
        });
      }

      // If the restaurant exists and the dish does not exist, create the dish
      const createDishQuery: Query = {
        text: 'INSERT INTO dishes (name, description, price, restaurantId) VALUES ($1, $2, $3, $4) RETURNING *',
        values: [name, description, price, restaurantId],
      };
      const result = await db.query(createDishQuery);
      res
        .status(201)
        .json({ message: 'Dish created successfully.', data: result.rows[0] });
    } catch (error) {
      console.error('Error creating dish:', error);
      res
        .status(500)
        .json({ message: 'An error occurred while creating the dish.' });
    }
  }

  async updateDish(req: Request, res: Response) {
    const restaurantId = req.params.id; // Assuming the restaurant ID is passed as a route parameter
    const dishId = req.params.dishId;
    const { description, price } = req.body;

    if (!description || !price) {
      return res
        .status(400)
        .json({ message: 'Description and price are required.' });
    }

    // Check if price is a number
    if (typeof price !== 'number') {
      return res.status(400).json({ message: 'Price must be a number.' });
    }

    // Check if description is a string
    if (typeof description !== 'string') {
      return res.status(400).json({ message: 'Description must be a string.' });
    }

    try {
      // Check if the dish exists and belongs to the restaurant
      const dishQuery: Query = {
        text: 'SELECT * FROM dishes WHERE id = $1 AND restaurantId = $2',
        values: [dishId, restaurantId],
      };
      const dish = await db.query(dishQuery);
      if (dish.rows.length === 0) {
        res.status(404).json({
          message:
            'Dish not found or you do not have permission to update this dish.',
        });
        return;
      }

      // Update the dish
      const updateQuery: Query = {
        text: 'UPDATE dishes SET description = $1, price = $2 WHERE id = $3 AND restaurantId = $4',
        values: [description, price, dishId, restaurantId],
      };
      await db.query(updateQuery);
      res.status(200).json({ message: 'Dish updated successfully.' });
    } catch (error) {
      console.error('Error updating dishes:', error);
      res
        .status(500)
        .json({ message: 'An error occurred while updating the dish.' });
    }
  }

  async deleteDish(req: Request, res: Response) {
    const restaurantId = req.params.id; // Assuming the restaurant ID is passed as a route parameter
    const dishId = req.params.dishId;
    // console.log(restaurantId, dishId);
    try {
      // Check if the dish exists and belongs to the restaurant
      const dishQuery: Query = {
        text: 'SELECT * FROM dishes WHERE id = $1 AND restaurantId = $2',
        values: [dishId, restaurantId],
      };
      // console.log(dishQuery);
      const dish = await db.query(dishQuery);
      // console.log(dish.rows);
      if (dish.rows.length === 0) {
        res.status(404).json({
          message:
            'Dish not found or you do not have permission to delete this dish.',
        });
        return;
      }

      // Delete the dish
      const deleteQuery: Query = {
        text: 'DELETE FROM dishes WHERE id = $1 AND restaurantId = $2',
        values: [dishId, restaurantId],
      };
      await db.query(deleteQuery);
      res.status(204).json({ message: 'Dish deleted successfully.' });
    } catch (error) {
      console.error('Error deleting dish:', error);
      res
        .status(500)
        .json({ message: 'An error occurred while deleting the dish.' });
    }
  }

  async getAllDishesByRestaurantId(req: Request, res: Response) {
    // Implementation for retrieving all dishes by restaurant ID
    // Check if the restaurant exists
    const restaurantId = req.params.id;
    const checkRestaurantQuery: Query = {
      text: 'SELECT * FROM restaurants WHERE id = $1',
      values: [restaurantId],
    };
    const restaurantResult = await db.query(checkRestaurantQuery);
    if (restaurantResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'Restaurant with this ID does not exist.' });
    }

    // Get all dishes by restaurant ID
    const query: Query = {
      text: 'SELECT * FROM dishes WHERE restaurantId = $1',
      values: [restaurantId],
    };
    const dishes = await db.query(query);
    res.status(200).json(dishes.rows);
  }
}

export default new dishController();
