import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import client from './db/db';
import RestaurantRouter from './routes/restaurantRoutes';
import RatingRouter from './routes/ratingsRoutes';
import OrderRouter from './routes/orderRoutes';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Restaurant API',
      description: 'Restaurant API Information',
      contact: {
        name: 'Developer Name',
      },
      servers: ['http://localhost:8000'],
      version: '1.0.0', // Add the version property
    },
  },
  apis: ['./routes/*.ts'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use('/restaurants', RestaurantRouter);
app.use('/ratings', RatingRouter);
app.use('/order', OrderRouter);

// Middleware for handling unknown routes
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send({ message: 'Route not found' });
});

// Error-handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    const bodyParserError = err as SyntaxError & { status?: number };
    if (bodyParserError.status === 400) {
      return res
        .status(400)
        .send({ message: 'Malformed JSON in request body' });
    }
  }

  next();
});

app.listen(port, () => {
  console.log(`Server is On at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  client.end((err: Error) => {
    if (err) {
      console.error('error during disconnection', err.stack);
    }
    process.exit();
  });
});

process.on('SIGTERM', () => {
  client.end((err: Error) => {
    if (err) {
      console.error('error during disconnection', err.stack);
    }
    process.exit();
  });
});
