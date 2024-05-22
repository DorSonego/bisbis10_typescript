import { Request, Response, Router } from 'express';
import db from '../db/db';
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const result = await db.query('SELECT * FROM restaurant');
  res.json(result.rows);
});

export default router;
