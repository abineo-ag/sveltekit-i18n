import { Summary, SummaryItem } from '../types';

const OK = '✔️';
const ERR = '❌';

export function toSummaryFile(summary: Summary): string {
	function asObject(items: (Summary | SummaryItem)[]): { [key: string]: string } {
		let obj = {};
		items.forEach((item) => {
			if ('items' in item) {
				obj[item.key] = asObject(item.items);
			} else {
				const missing = summary.languages.filter(
					(language) => !item.languages.includes(language)
				);
				const status =
					missing.length > 0
						? `${ERR} ${missing.join()} ${missing.length > 1 ? 'are' : 'is'} incomplete`
						: OK;
				obj[item.key] = status;
			}
		});
		return obj;
	}

	return JSON.stringify(asObject(summary.items), null, '\t');
}
