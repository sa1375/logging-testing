/**
 * This interceptor is responsible for:
 *
 * 1. Extracting or generating a unique request ID
 * 2. Attaching it to the response headers
 * 3. Creating an async context for the current request
 * 4. Making request-specific data available across the entire async lifecycle
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import { requestContext } from './request-context';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Switch execution context to HTTP( Nest supports other transports like RPC and WebSockets)
    const http = context.switchToHttp();

    // Extract Express request and response objects
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    // Try to read existing request ID from incoming headers.  Header name: x-request-id
    const headerRequestId = req.headers['x-request-id'];

    /**
     * Determine final requestId value:
     * Cases:
     * - If header is a string → use it directly
     * - If header is an array → use first value
     * - If header is missing → generate a new UUID
     */
    const requestId =
      typeof headerRequestId === 'string'
        ? headerRequestId
        : Array.isArray(headerRequestId)
          ? headerRequestId[0] || randomUUID()
          : randomUUID();

    /**
     * Attach the requestId to the response headers.
     *
     * This ensures clients receive the same correlation ID,
     * which helps with debugging and tracing across systems.
     */
    res.setHeader('x-request-id', requestId);

    /**
     * Create a new AsyncLocalStorage context for this request.
     *
     * Everything executed inside this callback
     * (including async operations) will have access to:
     *
     *   requestContext.getStore()
     *
     * which returns:
     *   { requestId }
     *
     * This ensures per-request isolation of contextual data.
     */
    return requestContext.run({ requestId }, () => {
      return next.handle(); // goes to the next interceptor and returns an observable object of request contex
    });
  }
}
