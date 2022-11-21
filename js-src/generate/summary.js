import fileheader from '../assets/fileheader';

const OK = '✔️';
const ERR = '❌';
const tab = (i) => '\t'.repeat(i);

export function toSummaryFile(summary) {
	function asObject(items) {
		let obj = {};
		items.forEach((item) => {
			obj[item.key] = {};
			if ('items' in item) {
				obj[item.key].items = asObject(item.items);
			} else {
				obj[item.key].params = item.params.map((p) => `${p.name}: ${p.type}`);
			}
			const errors = [];
			const missing = summary.languages.filter(
				(language) => !item.languages.includes(language)
			);
			if (missing.length > 0) errors.push(`${ERR} ${missing.join()} missing`);
			if ('paramErr' in item && item.paramErr) errors.push(`${ERR} different parameters`);
			obj[item.key].errors = errors;
		});
		return obj;
	}

	function getLines(obj, i = 1) {
		const lines = [];
		const attrs = Object.keys(obj);
		for (let a = 0; a < attrs.length; a++) {
			const isLast = a + 1 === attrs.length;
			const key = attrs[a];
			const item = obj[key];
			if ('items' in item) {
				let line = `${tab(i)}"${key}": {\n`;
				const itemAttrs = Object.keys(item.items);
				if (itemAttrs.length > 0) {
					line += getLines(item.items, i + 1);
				}
				line += `\n${tab(i)}}`;
				if (!isLast) line += ',';
				lines.push(line);
			} else {
				let line = `${tab(i)}"${key}": "`;
				if (item.errors.length > 0) {
					line += item.errors.join(' ');
				} else line += OK;
				if (isLast) line += '"';
				else line += '",';
				if (item.params.length > 0) {
					line += ' // ' + item.params.join(', ');
				}
				lines.push(line);
			}
		}
		return lines.join('\n');
	}

	const obj = asObject(summary.items);
	const lines = getLines(obj);
	return fileheader() + `{\n${lines}\n}\n`;
}
