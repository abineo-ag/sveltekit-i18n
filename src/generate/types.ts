import fileheader from '../assets/fileheader';
import { Summary, SummaryItem } from '../types';

const tab = (i: number) => '\t'.repeat(i);

export function toTypesFile(summary: Summary): string {
	function toLines(items: (Summary | SummaryItem)[], i = 1): string {
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
export type Language = '${summary.languages.join("' | '")}' | string;

export interface Translation {
${toLines(summary.items)}
}
`
	);
}
