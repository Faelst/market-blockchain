/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { NftsService } from "../services/nfts.service";

function parseHistoryQuery(req: Request) {
  const page = Math.max(parseInt(String(req.query.page ?? "1"), 10) || 1, 1);
  const limitRaw = parseInt(String(req.query.limit ?? "20"), 10);
  const limit = Math.min(Math.max(limitRaw || 20, 1), 100);

  const rawType = (req.query.type as string | undefined)?.toLowerCase();

  const type = rawType === "delist" ? "unlist" : rawType;

  return { page, limit, type };
}

export const NftsController = {
  async list(req: Request, res: Response) {
    const query = { ...req.query };
    if (
      (req as any).user &&
      (query.owner === "true" || query.creator === "true")
    ) {
      query.userId = (req as any).user.id;
    }
    const data = await NftsService.list(query);
    res.json(data);
  },

  async get(req: Request, res: Response) {
    const data = await NftsService.getDetail(req.params.id);
    res.json(data);
  },

  async mint(req: Request, res: Response) {
    const nft = await NftsService.mint((req as any).user.id, req.body);
    res.status(201).json(nft);
  },

  async listForSale(req: Request, res: Response) {
    const nft = await NftsService.listForSale(
      (req as any).user.id,
      req.params.id,
      req.body.price
    );
    res.json(nft);
  },

  async unlist(req: Request, res: Response) {
    const nft = await NftsService.unlist((req as any).user.id, req.params.id);
    res.json(nft);
  },

  async buy(req: Request, res: Response) {
    const result = await NftsService.buy((req as any).user.id, req.params.id);
    res.json(result);
  },

  async transactions(req: Request, res: Response) {
    const items = await NftsService.transactions(req.params.id);
    res.json(items);
  },

  async history(req: Request, res: Response) {
    const { page, limit, type } = parseHistoryQuery(req);
    const data = await NftsService.transactions(req.params.id, {
      page,
      limit,
      type,
    });

    res.json(data);
  },
};
