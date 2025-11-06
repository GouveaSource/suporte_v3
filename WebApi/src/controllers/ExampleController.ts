import { Request, Response } from "express";

export class ExampleController {
  static health(req: Request, res: Response) {
    res.json({
      status: "OK",
      message: "API conectada e funcional 🚀",
      timestamp: new Date().toISOString(),
    });
  }
}
