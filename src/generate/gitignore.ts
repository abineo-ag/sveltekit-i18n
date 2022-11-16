export function toGitignore(folder: string): string {
	return `/${folder}\n/index.ts\n/types.ts\n/summary.json\n`;
}
