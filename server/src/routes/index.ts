
import { Express } from 'express';
import userRoutes from './userRoutes';
import bankAccountRoutes from './bankAccountRoutes';
import logRoutes from './logRoutes';
import authRoutes from './authRoutes';

export const setupRoutes = (app: Express) => {
  app.use('/api/users', userRoutes);
  app.use('/api/bank-accounts', bankAccountRoutes);
  app.use('/api/logs', logRoutes);
  app.use('/api/auth', authRoutes);
};
