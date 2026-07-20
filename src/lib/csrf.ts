import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

export function csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existing = req.cookies?.csrf_token;
  if (!existing || existing.length < 16) {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie("csrf_token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
  }

  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (req.path.startsWith("/api/auth/")) return next();

  const headerToken = req.headers["x-csrf-token"] as string | undefined;
  const cookieToken = req.cookies?.csrf_token as string | undefined;

  if (!headerToken || !cookieToken || headerToken.length !== cookieToken.length) {
    res.status(403).json({ message: "CSRF token inválido." });
    return;
  }

  if (!crypto.timingSafeEqual(Buffer.from(headerToken), Buffer.from(cookieToken))) {
    res.status(403).json({ message: "CSRF token inválido." });
    return;
  }
  next();
}
