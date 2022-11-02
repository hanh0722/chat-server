import { Router } from 'express';
import userRoutes from '../../routes/user';
import roomRoutes from '../../routes/room';
import chatRoutes from '../../routes/chat';

interface Route {
  path: string;
  controller: Router
}

type Routes = Array<Route>;

export const RoutesController: Routes = [
  {
    path: '/api/user',
    controller: userRoutes
  },
  {
    path: '/api/room',
    controller: roomRoutes
  },
  {
    path: '/api/chats',
    controller: chatRoutes
  }
]