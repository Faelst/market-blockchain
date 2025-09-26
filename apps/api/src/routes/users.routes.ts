import { Router } from "express";
import { UsersController } from "../controllers/users.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/:id", (req, res, next) =>
  UsersController.getById(req, res).catch(next)
);
router.patch("/me", requireAuth, (req, res, next) =>
  UsersController.patchMe(req, res).catch(next)
);

router.get("/me/favorites", requireAuth, (req, res, next) =>
  UsersController.getMyFavorites(req, res).catch(next)
);
router.post("/me/favorites/:nftId", requireAuth, (req, res, next) =>
  UsersController.addMyFavorite(req, res).catch(next)
);
router.delete("/me/favorites/:nftId", requireAuth, (req, res, next) =>
  UsersController.removeMyFavorite(req, res).catch(next)
);

export default router;
