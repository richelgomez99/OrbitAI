import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import type { AppRouter } from '../../../server/appRouter';
import { supabase } from './supabaseClient';

export const trpc = createTRPCReact<AppRouter>();

export function getBaseUrl() {
  // 1. Prioritize VITE_API_BASE_URL if explicitly set (for Vercel/production client-side builds)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // 2. Browser environment (local dev) - use relative path for Vite proxy
  if (typeof window !== 'undefined') return '';
  // 3. Vercel SSR (fallback if VITE_API_BASE_URL not set - less ideal, API should be separate)
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // 4. Development SSR (e.g. local node server running client code, or if PORT is set for some reason)
  return `http://localhost:${process.env.PORT ?? 5001}`; // dev SSR should use localhost (adjusted port to likely 5001 for local Express)
}

export function getTRPCUrl() {
  return `${getBaseUrl()}/trpc`;
}

/**
 * tRPC client with automatic JWT authentication.
 *
 * Automatically includes the user's JWT token from Supabase in all requests.
 * If the user is not authenticated, requests will fail with UNAUTHORIZED error.
 */
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getTRPCUrl(),
      /**
       * Include JWT token in Authorization header for all requests.
       * The server's authedProcedure middleware will validate this token.
       */
      async headers() {
        // Get current session from Supabase
        const { data: { session } } = await supabase.auth.getSession();

        // If user is authenticated, include token in headers
        if (session?.access_token) {
          return {
            authorization: `Bearer ${session.access_token}`,
          };
        }

        // If not authenticated, return empty headers
        // Server will reject requests to protected endpoints
        return {};
      },
    }),
  ],
});
