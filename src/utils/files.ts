import { stat } from 'fs/promises'
import { GithubPayload } from '../types/github.types.js'
import { execSync } from 'child_process'

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

export async function getFileCreationDate(filePath: string): Promise<Date> {
    const stats = await stat(filePath)
    return stats.ctime
}

export async function getGitFileCreationDate(filePath: string): Promise<Date> {
    const timestamp = execSync(
        `git log --diff-filter=A --follow --format=%at -1 -- "${filePath}"`,
        { encoding: 'utf8' }
    ).trim()

    const creationDate = timestamp
        ? new Date(parseInt(timestamp) * 1000)
        : new Date()
    return creationDate
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
