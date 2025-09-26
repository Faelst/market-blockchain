/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = (
    req.header("x-request-id") ||
    req.header("X-Request-Id") ||
    ""
  ).trim();
  const id = incoming || randomUUID();

  req.requestId = id;
  res.setHeader("x-request-id", id);

  const exposed = res.getHeader("Access-Control-Expose-Headers");
  const exposeList = (
    Array.isArray(exposed) ? exposed.join(",") : String(exposed || "")
  ).toLowerCase();
  if (!exposeList.includes("x-request-id")) {
    res.setHeader(
      "Access-Control-Expose-Headers",
      [exposeList, "x-request-id"].filter(Boolean).join(", ")
    );
  }

  next();
}
