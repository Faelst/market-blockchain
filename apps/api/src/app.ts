import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import compression from "compression";
import logger from "res-notification";
import path from "path";
import helmet from "helmet";
import routes from "./routes";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler, notFound } from "./middleware/error";
import { apiRateLimit } from "./middleware/rateLimit";
import {
  marketStatsCache,
  nftListCache,
  collectionListCache,
} from "./middleware/cache";
import { requestId } from "./middleware/requestId";

export function createApp() {
  const app = express();

  app.use(requestId);
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(apiRateLimit);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(morgan("dev"));
  app.use(compression());
  app.use(cookieParser());
  app.use(corsMiddleware);

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.get("/health", (_req, res) =>
    res.json({
      success: true,
      message: "API is healthy",
      timestamp: new Date().toISOString(),
    })
  );

  app.use("/market/stats", marketStatsCache);
  app.use("/nfts", nftListCache);
  app.use("/collections", collectionListCache);

  app.use(routes);

  app.use(notFound);
  app.use(errorHandler);
  logger();

  return app;
}
