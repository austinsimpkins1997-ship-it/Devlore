import { createUserClient } from '@/lib/github/client';

export async function getUserRepos(accessToken: string) {
  const octokit = createUserClient(accessToken);
  const repos = [];
  let page = 1;
  while (true) {
    const response = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 100,
      page,
      sort: 'updated'
    });
    
    if (response.data.length === 0) break;
    
    for (const repo of response.data) {
      repos.push({
        name: repo.name,
        full_name: repo.full_name,
        language: repo.language,
        size: repo.size,
        stargazers_count: repo.stargazers_count || 0,
        topics: repo.topics || [],
        private: repo.private
      });
    }
    
    if (response.data.length < 100) break;
    page++;
  }
  return repos;
}

export async function getLanguageStats(accessToken: string, repos: string[]): Promise<Record<string, number>> {
  const octokit = createUserClient(accessToken);
  const stats: Record<string, number> = {};
  
  for (const fullName of repos) {
    try {
      const [owner, repo] = fullName.split('/');
      const response = await octokit.rest.repos.listLanguages({ owner, repo });
      for (const [lang, bytes] of Object.entries(response.data)) {
        if (!stats[lang]) stats[lang] = 0;
        stats[lang] += bytes as number;
      }
    } catch {
      // Ignore errors for individual repos
    }
  }
  
  return stats;
}

export async function getCommitMessages(accessToken: string, owner: string, repo: string, since: string, until: string): Promise<string[]> {
  const octokit = createUserClient(accessToken);
  try {
    const response = await octokit.rest.repos.listCommits({
      owner,
      repo,
      since,
      until,
      per_page: 100
    });
    return response.data.map(commit => commit.commit.message);
  } catch {
    return [];
  }
}

export async function getWeeklyCommitMessages(accessToken: string, username: string, repos: string[], since: string, until: string): Promise<string[]> {
  const messages: string[] = [];
  for (const fullName of repos) {
    const [owner, repo] = fullName.split('/');
    const repoMessages = await getCommitMessages(accessToken, owner, repo, since, until);
    messages.push(...repoMessages);
    if (messages.length > 50) break;
  }
  return messages.slice(0, 50);
}
