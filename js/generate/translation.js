import fileheader from '../assets/fileheader';

const tab = (i) => '\t'.repeat(i);

export function toTranslationFile(translation) {
	function toLines(items, i = 1) {
		return items
			.map((item) => {
				let line = `${tab(i)}${item.key}: `;
				if ('params' in item) {
					if (item.params.length > 0) {
						const params = item.params.map((p) => `${p.name}: ${p.type}`).join(', ');
						let template = item.template;
						item.params.forEach((param) => {
							param.strings.forEach((string) => {
								if (template.split(string).length > 1)
									template = template.split(string).join('${' + param.name + '}');
							});
						});
						line += `(${params}): string => \`${template}\`,`;
					} else {
						line += `'${item.template}',`;
					}
				} else {
					line += '{\n';
					line += toLines(item.items, i + 1);
					line += `\n${tab(i)}},`;
				}
				return line;
			})
			.join('\n');
	}

	return (
		fileheader() +
		`
import type { Translation } from '../types';

/** ${translation.lang} */
const translation: Translation = {
${toLines(translation.items)}
}

export default translation;
`
	);
}
