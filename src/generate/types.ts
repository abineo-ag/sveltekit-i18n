import fileheader from '../assets/fileheader';
import { Summary, SummaryItem } from '../types';

const TAB = '\t';

export function toTypesFile(summary: Summary): string {
	function toType(items: (Summary | SummaryItem)[], indent = 1) {
		// TODO
	}

	return (
		fileheader() +
		`
export type Language = '${summary.languages.join("' | '")}';

export interface Translation {
${TAB}${toType(summary.items)}
}
`
	);
}
