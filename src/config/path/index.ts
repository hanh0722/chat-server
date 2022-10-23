import { Router } from 'express';
import userRoutes from '../../routes/user';

interface Route {
  path: string;
  controller: Router
}

type Routes = Array<Route>;

export const RoutesController: Routes = [
  {
    path: '/api/user',
    controller: userRoutes
  }
]