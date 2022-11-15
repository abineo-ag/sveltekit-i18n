import { jsoncSafe as jsonc } from 'jsonc/lib/jsonc.safe';
import { Parameter, Resource, Summary, Translation } from './types';

// Match valid json key in curly brackets with optional type separated by a colon
// https://regex101.com/r/F2mkIm/1
// example: 'Hello {name}, you are {{ age: number }} years old.' => [name, any | string] and [age, number]
const REGEX = new RegExp(/(?<!\\)\{+\s*([a-z]+[a-z0-9]*)\s*:?\s*([a-z]+[a-z0-9]*)*\s*(?<!\\)\}+/gi);

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
	const matches = str.matchAll(REGEX);
	for (const match of matches) {
		if (match[1]) {
			params.push({ name: match[1], type: match[2] || defaultType });
		}
	}
	return params;
}

export function toSummary(resources: Resource[]): Summary {
	// TODO: implement merging
	return {
		key: '<root>',
		languages: [],
		items: [],
	};
}
