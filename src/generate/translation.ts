import { Resource, Summary, Translation } from '../types';

export function toTranslationFile(translation: Translation, summary: Summary): string {
	function toType(rsc: Resource, indent: number = 0): string {
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

	let code = 'import { Translation } from "..";\n';
	code += translation.items.map((rsc) => toType(rsc)).join('\n');

	// TODO implement me
	return '';
}
