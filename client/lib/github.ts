import { getServerSession } from "next-auth";

export async function fetchGitHubData(endpoint: string) {
  const session = await getServerSession();

  if (!session?.accessToken) {
    throw new Error("No GitHub access token found");
  }

  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}

// Example usage:
// const userRepos = await fetchGitHubData('/user/repos');
// const userOrgs = await fetchGitHubData('/user/orgs');
