import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Task } from './entity/Task';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'tasks.db',
  synchronize: true,
  logging: false,
  entities: [Task],
});
