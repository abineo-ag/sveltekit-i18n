import { jsoncSafe as jsonc } from 'jsonc/lib/jsonc.safe';
import { isEqual } from 'lodash';
import { Parameter, Resource, Summary, SummaryItem, Translation } from './types';

// Match valid json key in curly brackets with optional type separated by a colon
// https://regex101.com/r/ZAhsUS/1
// example: 'Hello {name}, you are {{ age: number }} years old.' => [name, any | string] and [age, number]
const PARAM = /\{\s*([a-z]+[a-z0-9]*)\s*:?\s*([a-z]+[a-z0-9]*)*\s*\}/gi;

let defaultType = 'any';

export function configure(type: string) {
	defaultType = type;
}

export function toLanguageCode(filename: string): string {
	return filename.split('.')[0].trim();
}

export function parse(languageCode: string, fileContent: string): Translation | null {
	if (languageCode.length < 2) {
		console.error(`invalid language code: '${languageCode}', ignoring file '${languageCode}'`);
		return null;
	}

	const [err, jsonString] = jsonc.stripComments(fileContent);
	if (err || !jsonString) return null;

	const [err2, obj] = jsonc.parse(jsonString);
	if (err2 || !obj) return null;

	return {
		lang: languageCode,
		items: Object.keys(obj).map((key) => toResource(key, obj[key])),
	};
}

export function toResource(key: string, value: any): Resource {
	if (typeof value === 'object' && Array.isArray(value) === false) {
		const items = Object.keys(value).map((key) => toResource(key, value[key]));
		return { key, items };
	}
	const template = typeof value === 'string' ? value : value.toString ? value.toString() : '';
	const params = getParams(template);
	return { key, template, params };
}

export function getParams(str: string): Parameter[] {
	const params: Parameter[] = [];
	const matches = str.matchAll(new RegExp(PARAM));
	for (const match of matches) {
		if (match[1]) {
			const newParam = { strings: [match[0]], name: match[1], type: match[2] || defaultType };
			const existing = params.findIndex((param) => param.name === newParam.name);
			if (existing > -1) {
				params[existing].strings.push(newParam.strings[0]);
				if (params[existing].type !== newParam.type)
					params[existing].type += ' | ' + newParam.type;
			} else params.push(newParam);
		}
	}
	return params;
}

export function toSummary(translations: Translation[]): Summary {
	function summarize(items: [string, Resource[]][]): (Summary | SummaryItem)[] {
		const keys: Set<string> = new Set();
		items.forEach((item) => item[1].forEach((rsc) => keys.add(rsc.key)));

		const sums: any[] = [];
		keys.forEach((key) => {
			const rscItems: [string, Resource][] = items
				.filter((item) => item[1].find((rsc) => rsc.key === key))
				.map((item) => {
					// @ts-ignore (rsc is not undefined)
					const rsc: Resource = item[1].find((rsc) => rsc.key === key);
					return [item[0], rsc];
				});
			const languages = rscItems.map((item) => item[0]);
			if (rscItems.some((i) => 'items' in i[1])) {
				const items = summarize(
					rscItems
						.filter((item) => 'items' in item[1])
						// @ts-ignore ('items' in item[1] is defined)
						.map((item) => [item[0], item[1].items])
				);
				sums.push({ key, items, languages });
			} else if (rscItems.some((i) => 'params' in i[1])) {
				const allParams: Parameter[][] = rscItems
					.filter((item) => 'params' in item[1])
					// @ts-ignore ('params' in item[1] is defined)
					.map((item) => item[1].params);
				const params = allParams.pop();
				let paramErr = false;
				for (const p of allParams) {
					if (!isEqual(params, p)) {
						paramErr = true;
						break;
					}
				}
				sums.push({ key, params, languages, paramErr });
			}
		});
		return sums;
	}

	const items = summarize(translations.map((t) => [t.lang, t.items]));
	const languages = translations.map((t) => t.lang);
	return { key: '<root>', languages, items };
}
