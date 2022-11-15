import { Resource, Summary, Translation } from './types';

export function toType(rsc: Resource, indent: number = 0): string {
	let code = '';
	const pad = '\t'.repeat(indent);
	if ('items' in rsc) {
		code = rsc.items.map((r) => toType(r, indent + 1)).join('\n');
		// FIXME
	} else if (rsc.template && rsc.params) {
		// FIXME
	}

	return code;
}

export function toTranslationFile(translation: Translation, summary: Summary): string {
	let code = 'import { Translation } from "..";\n';
	code += translation.items.map((rsc) => toType(rsc)).join('\n');
	// TODO implement me
	return code;
}

export function toIndexFile(summary: Summary): string {
	let code = '';
	// TODO implement me
	return code;
}

export function toTypesFile(summary: Summary): string {
	let code = '';
	// TODO implement me
	return code;
}

export function toSummaryFile(summary: Summary): string {
	let code = '';
	// TODO implement me
	return code;
}

export function toGitignore(folder: string): string {
	return `/${folder}\n/index.ts\n/types.ts\n`;
}
