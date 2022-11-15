import { LanguageModel, Resource } from './parser';

export function toType(rsc: Resource, indent: number = 0): string {
	let code = '';
	const pad = '\t'.repeat(indent);
	if (rsc.resources) {
		code = rsc.resources.map((r) => toType(r, indent + 1)).join('\n');
	} else if (rsc.template && rsc.params) {
	}

	return code;
}

export function translation(model: LanguageModel, combined: LanguageModel): string {
	let code = 'import { Translation } from "..";\n';
	code += model.resources.map((rsc) => toType(rsc)).join('\n');
	// TODO implement me
	return code;
}

export function index(combined: LanguageModel): string {
	let code = '';
	// TODO implement me
	return code;
}
