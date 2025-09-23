import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';

export const UsersController = {
  async getById(req: Request, res: Response) {
    const user = await UsersService.getById(req.params.id);
    res.json(user);
  },

  async patchMe(req: Request, res: Response) {
    const me = await UsersService.patchMe((req as any).user.id, req.body);
    res.json(me);
  },
};