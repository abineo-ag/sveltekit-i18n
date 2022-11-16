import fileheader from '../assets/fileheader';

export function toGitignore(folder: string): string {
	return `${fileheader('#', 1)}/${folder}\n/index.ts\n/types.ts\n/summary.jsonc\n`;
}
