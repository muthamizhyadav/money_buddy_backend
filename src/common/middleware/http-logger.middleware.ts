import {
    Injectable,
    Logger,
    NestMiddleware,
  } from '@nestjs/common';
  import { Request, Response, NextFunction } from 'express';
  import { randomUUID } from 'crypto';
  
  @Injectable()
  export class HttpLoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');
  
    use(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      const requestId = randomUUID();
      const startTime = Date.now();
  
      req.headers['x-request-id'] = requestId;
  
      res.setHeader('X-Request-ID', requestId);
  
      res.on('finish', () => {
        const duration = Date.now() - startTime;
  
        const statusCode = res.statusCode;
  
        const logMessage =
          `${req.method} ${req.originalUrl} ` +
          `${statusCode} ` +
          `${duration}ms ` +
          `IP=${req.ip} ` +
          `RequestID=${requestId}`;
  
        if (statusCode >= 500) {
          this.logger.error(logMessage);
        } else if (statusCode >= 400) {
          this.logger.warn(logMessage);
        } else {
          this.logger.log(logMessage);
        }
      });
  
      next();
    }
  }