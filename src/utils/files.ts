import { stat } from 'fs/promises'
import { GithubPayload } from '../types/github.types.js'

/**
 * Gets the modification date of a file.
 * @param filePath - The path to the file.
 * @returns A promise that resolves to the file's modification date.
 * @throws Will throw an error if the file does not exist or cannot be accessed.
 */
export async function getFileModificationDate(filePath: string): Promise<Date> {
  const stats = await stat(filePath)
  return stats.mtime
}

/**
 * Extracts all files added across multiple commits from a GitHub webhook payload.
 * @param githubPayload - The GitHub webhook payload containing commit information
 * @returns An array of file paths that were added in the commits
 */
export function getFilesAddedInCommits(githubPayload: GithubPayload): string[] {
  return githubPayload.commits.flatMap((commit: { added: string[] }) => {
    return commit.added
  })
}
