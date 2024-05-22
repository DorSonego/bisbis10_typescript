import { text } from 'express';
import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'example',
  database: 'postgres',
});

client.connect((err: Error) => {
  if (err) {
    console.error('DB connection error', err.stack);
  } else {
    console.log('connected to DB');
  }
});

export default client;
