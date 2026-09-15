/**
 * Database access.
 *
 * `client` creates the Supabase client from the environment; `queries` holds
 * the readable operations. Everything is a plain function over a client, so it
 * can be tested against a stub.
 */
export * from "./client.js";
export * from "./queries.js";
