/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { UsersService } from "../services/users.service";
import { HttpError } from "../utils/errors";

export const UsersController = {
  async getById(req: Request, res: Response) {
    const user = await UsersService.getById(req.params.id);
    res.json(user);
  },

  async patchMe(req: Request, res: Response) {
    const me = await UsersService.patchMe((req as any).user.id, req.body);
    res.json(me);
  },

  async getMyFavorites(req: Request, res: Response) {
    const items = await UsersService.getFavorites((req as any).user.id);
    res.json({ items });
  },

  async addMyFavorite(req: Request, res: Response) {
    const nftId = String(req.params.nftId || "");

    await UsersService.addFavorite((req as any).user.id, nftId);
    res.json({ ok: true });
  },

  async removeMyFavorite(req: Request, res: Response) {
    const nftId = String(req.params.nftId || "");

    await UsersService.removeFavorite((req as any).user.id, nftId);

    res.json({ ok: true });
  },
};
