import { Request, Response, NextFunction } from 'express';
import { AuthService, authService } from './auth.service.js';

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.register(req.body, req.ip);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.login(req.body, req.ip);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  logout = async (_req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  };
}

export const authController = new AuthController();
