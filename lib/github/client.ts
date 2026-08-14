import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';

export const GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

/**
 * Creates a typed Octokit REST client authenticated with the user's OAuth token.
 * Use this for REST API calls (repo listing, language stats, etc.)
 */
export function createUserClient(accessToken: string): Octokit {
  return new Octokit({ auth: accessToken });
}

/**
 * Creates a typed GraphQL client authenticated with the user's OAuth token.
 * Use this for contribution calendar, streak data, etc.
 * (GraphQL is not available via @octokit/rest directly)
 */
export function createGraphQLClient(accessToken: string) {
  return graphql.defaults({
    headers: {
      authorization: `token ${accessToken}`,
    },
  });
}

/**
 * Creates an unauthenticated client for public data (fallback only).
 * Rate limit: 60 requests/hour. Use only when no token is available.
 */
export function createPublicClient(): Octokit {
  return new Octokit();
}
