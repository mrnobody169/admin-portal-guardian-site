
import { Express } from 'express';
import bankAccountRoutes from './bankAccountRoutes';
import logRoutes from './logRoutes';
import siteRoutes from './siteRoutes';
import accountLoginRoutes from './accountLoginRoutes';
import accountUserRoutes from './accountUserRoutes';
import authRoutes from './authRoutes';

export const setupRoutes = (app: Express) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/bank-accounts', bankAccountRoutes);
  app.use('/api/logs', logRoutes);
  app.use('/api/sites', siteRoutes);
  app.use('/api/account-logins', accountLoginRoutes);
  app.use('/api/account-users', accountUserRoutes);
};
