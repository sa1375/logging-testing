// src/logger/request-context.ts

/**
 * This file creates a request-scoped async context storage.
 *
 * It allows us to store and access request-specific data
 * (such as requestId) across asynchronous operations
 * without manually passing it through every function.
 */

import { AsyncLocalStorage } from 'async_hooks';

/**
 * Defines the shape of the data stored per request.
 *
 * Each incoming HTTP request can have its own context object.
 * Currently, we only store:
 *
 * - requestId → a unique identifier for tracing logs
 *
 * This interface can be extended later with:
 * - userId
 * - tenantId
 * - roles
 * - correlationId
 * etc.
 */
export interface RequestContextData {
  requestId: string;
}

/**
 * AsyncLocalStorage instance for request-level context.
 *
 * What it does:
 * - Creates isolated storage for each async execution chain.
 * - Preserves data across:
 *     - async/await
 *     - promises
 *     - database calls
 *     - nested service calls
 *
 * How it works:
 * - requestContext.run(context, callback)
 *     → starts a new async context
 *
 * - requestContext.getStore()
 *     → retrieves the current request's context
 *
 * This is typically initialized in a middleware when a new HTTP request starts.
 */
export const requestContext = new AsyncLocalStorage<RequestContextData>();
