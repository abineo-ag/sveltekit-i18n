import { jsoncSafe as jsonc } from 'jsonc/lib/jsonc.safe';

// Match valid json key in curly brackets with optional type separated by a colon
// https://regex101.com/r/F2mkIm/1
// example: 'Hello {name}, you are {{ age: number }} years old.' => [name, any | string] and [age, number]
const REGEX = new RegExp(/(?<!\\)\{+\s*([a-z]+[a-z0-9]*)\s*:?\s*([a-z]+[a-z0-9]*)*\s*(?<!\\)\}+/gi);

export interface Parameter {
	name: string;
	type: string;
}

export interface Resource {
	key: string;
	template?: string;
	params?: Parameter[];
	resources?: Resource[];
}

export interface LanguageModel {
	lang: string;
	resources: Resource[];
}

let defaultType = 'any';
let printDebug = false;

export function configure(type: string, debug: boolean) {
	defaultType = type;
	printDebug = debug;
}

export function toLanguageCode(filename: string): string {
	return filename.split('.')[0].trim();
}

export function parse(languageCode: string, fileContent: string): LanguageModel | null {
	if (languageCode.length < 2) {
		console.error(`invalid language code: '${languageCode}', ignoring file '${languageCode}'`);
		return null;
	}

	const [err, jsonString] = jsonc.stripComments(fileContent);
	if (err || !jsonString) {
		if (printDebug) console.debug('err in parse (jsonc.stripComments)', err);
		return null;
	}

	const [err2, obj] = jsonc.parse(jsonString);
	if (err2 || !obj) {
		if (printDebug) console.debug('err in parse (jsonc.parse)', err2);
		return null;
	}

	return {
		lang: languageCode,
		resources: Object.keys(obj).map((key) => toResource(key, obj[key])),
	};
}

export function toResource(key: string, value: any): Resource {
	const res: Resource = { key };

	if (typeof value === 'object' && Array.isArray(value) === false) {
		res.resources = Object.keys(value).map((key) => toResource(key, value[key]));
	} else if (typeof value === 'string') {
		res.template = value;
		res.params = getParams(value);
	} else if (value.toString) {
		res.template = value.toString();
		res.params = getParams(value.toString());
	}

	return res;
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

export function mergeResources(resources: Resource[]): Resource[] {
	// TODO: implement merging
	return resources;
}
