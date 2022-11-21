import fileheader from '../assets/fileheader';

const tab = (i) => '\t'.repeat(i);

export function toTypesFile(summary) {
	function toLines(items, i = 1) {
		return items
			.map((item) => {
				let line = `${tab(i)}${item.key}: `;
				if ('params' in item) {
					if (item.params.length > 0) {
						line += `(${item.params
							.map((p) => `${p.name}: ${p.type}`)
							.join(', ')}) => string;`;
					} else {
						line += 'string;';
					}
				} else {
					line += '{\n';
					line += toLines(item.items, i + 1);
					line += `\n${tab(i)}}`;
				}
				return line;
			})
			.join('\n');
	}

	return (
		fileheader() +
		`
export type Language = '${summary.languages.join("' | '")}';

export interface Translation {
${toLines(summary.items)}
}
`
	);
}
