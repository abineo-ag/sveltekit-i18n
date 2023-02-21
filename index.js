const fs = require('fs');
const path = require('path');
const jsonc = require('jsonc').safe;
const lodash = require('lodash');

const defaultOptions = {
	src: './src/lib/i18n/src',
	out: './src/lib/i18n',
	folder: 'dist',
	defaultParamType: 'string',
	createGitignore: true,
	createSummary: true,
};

function plugin(opts = defaultOptions) {
	let options = defaultOptions;
	lodash.assign(options, opts);
	let watcher;

	return {
		name: 'abineo-sveltekit-i18n',
		buildStart() {
			const { watchDir, transpile } = transpiler(options);
			watcher = fs.watch(watchDir, { recursive: false }, lodash.debounce(transpile, 2000));
		},
		buildEnd() {
			if (watcher && watcher.close) watcher.close();
		},
	};
}

module.exports = plugin;

// https://regex101.com/r/JgmSw2/1
const VALID_LANG = /^[a-z]{1,}(-[a-z]{1,})*$/gi;

function transpiler(options) {
	const srcDir = path.join(...options.src.split(/[\\\/]+/g));
	const outDir = path.join(...options.out.split(/[\\\/]+/g));
	const tsOutDir = path.join(outDir, options.folder);

	if (!fs.existsSync(srcDir)) throw `options.src: '${options.src}' must exists`;
	if (!fs.statSync(srcDir).isDirectory())
		throw `options.src: '${options.src}' must be a directory`;

	configure(options.defaultParamType);

	function parseFile(filename) {
		const content = fs.readFileSync(path.join(srcDir, filename), { encoding: 'utf8' });
		return parse(toLanguageCode(filename), content);
	}

	function transpile() {
		const entries = fs.readdirSync(srcDir).filter((file) => {
			if (!file.includes('.json')) return false; // '.jsonc' matches as well
			const lang = file.split('.json')[0]; // works for '.jsonc' matches as well
			if (new RegExp(VALID_LANG).test(lang)) return true;
			else {
				console.error(
					`ignore file '${file}' because '${lang}' is not a valid language code`
				);
				return false;
			}
		});
		const translations = entries
			.map((filename) => parseFile(filename))
			.filter((tr) => tr !== null);
		const summary = toSummary(translations);
		const files = [
			[path.join(outDir, 'types.ts'), toTypesFile(summary)],
			[
				path.join(outDir, 'index.ts'),
				toIndexFile(summary, options.folder, options.defaultLanguage),
			],
		];
		if (options.createGitignore) {
			files.push([path.join(outDir, '.gitignore'), toGitignore(options.folder)]);
		}
		if (options.createSummary) {
			files.push([path.join(outDir, 'summary.jsonc'), toSummaryFile(summary)]);
		}
		translations.forEach((translation) => {
			files.push([
				path.join(tsOutDir, `${translation.lang}.ts`),
				toTranslationFile(translation),
			]);
		});
		fs.rmSync(tsOutDir, { recursive: true, force: true });
		fs.mkdirSync(tsOutDir, { recursive: true });
		files.forEach(([file, content]) => {
			fs.writeFile(file, content, 'utf8', (err) => {
				err && console.error(err);
			});
		});
	}

	transpile();

	return { watchDir: srcDir, transpile };
}

// Match valid json key in curly brackets with optional type separated by a colon
// https://regex101.com/r/ZAhsUS/1
// example: 'Hello {name}, you are {{ age: number }} years old.' => [name, any | string] and [age, number]
const PARAM = /\{\s*([a-z]+[a-z0-9]*)\s*:?\s*([a-z]+[a-z0-9]*)*\s*\}/gi;

let defaultType = 'any';

function configure(type) {
	defaultType = type;
}

function toLanguageCode(filename) {
	return filename.split('.')[0].trim();
}

function parse(languageCode, fileContent) {
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

function toResource(key, value) {
	if (typeof value === 'object' && Array.isArray(value) === false) {
		const items = Object.keys(value).map((key) => toResource(key, value[key]));
		return { key, items };
	}
	const template = typeof value === 'string' ? value : value.toString ? value.toString() : '';
	const params = getParams(template);
	return { key, template, params };
}

function getParams(str) {
	const params = [];
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

function toSummary(translations) {
	function summarize(items) {
		const keys = new Set();
		items.forEach((item) => item[1].forEach((rsc) => keys.add(rsc.key)));

		const sums = [];
		keys.forEach((key) => {
			const rscItems = items
				.filter((item) => item[1].find((rsc) => rsc.key === key))
				.map((item) => {
					// @ts-ignore (rsc is not undefined)
					const rsc = item[1].find((rsc) => rsc.key === key);
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
				const allParams = rscItems
					.filter((item) => 'params' in item[1])
					// @ts-ignore ('params' in item[1] is defined)
					.map((item) => item[1].params);
				const params = allParams.pop();
				let paramErr = false;
				for (const p of allParams) {
					if (!lodash.isEqual(params, p)) {
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

const template = [
	'',
	'╔═══════════════════════════════╗\n',
	'║      AUTO GENERATED FILE      ║\n',
	'║    DO NOT EDIT ME DIRECTLY    ║\n',
	'╚═══════════════════════════════╝',
];

function fileheader(prefix = '//', indent = 4) {
	return template.join(prefix + ' '.repeat(indent)) + '\n';
}

function toGitignore(folder) {
	return `${fileheader('#', 1)}/${folder}\n/index.ts\n/types.ts\n/summary.jsonc\n`;
}

function toIndexFile(summary, folder, defaultLanguage) {
	defaultLanguage =
		defaultLanguage && summary.languages.includes(defaultLanguage)
			? defaultLanguage
			: summary.languages[0];
	const languages = summary.languages
		.map((lang) => {
			return {
				code: lang,
				name: new Intl.DisplayNames(lang, {
					type: 'language',
					languageDisplay: 'standard',
				}).of(lang),
			};
		})
		.map((lang) => {
			return `{ code: '${lang.code}', name: '${lang.name}' },`;
		});
	return (
		fileheader() +
		`
import { writable, derived, type Writable } from 'svelte/store';
import type { Language, Translation } from './types';
import defaultTranslation from './${folder}/${defaultLanguage}';

export const languageCodes: Language[] = ['${summary.languages.join("', '")}'];

export const defaultLanguage: Language = '${defaultLanguage}';

export const languages: { code: Language, name: string }[] = [
	${languages.join('\n\t')}
];

export const language: Writable<Language> = writable('${defaultLanguage}');

const dictionary: {[key: string]: Translation} = {
	'${defaultLanguage}': defaultTranslation
};
const translation: Writable<Translation> = writable(defaultTranslation);

language.subscribe(async (lang) => {
	if(dictionary[lang]) translation.set(dictionary[lang]);
	if(!languageCodes.includes(lang)) {
		console.warn('language', lang, 'is not available');
		translation.set(dictionary['${defaultLanguage}']);
	}
	dictionary[lang] = (await import(/* @vite-ignore */ './dist/' + lang)).default;
	translation.set(dictionary[lang]);
});

export const t = derived([translation], ([$translation]) => {
	return $translation;
});
`
	);
}

const OK = '✔️';
const ERR = '❌';
const tab = (i) => '\t'.repeat(i);

function toSummaryFile(summary) {
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
				lines.push(line);
			}
		}
		return lines.join('\n');
	}

	const obj = asObject(summary.items);
	const lines = getLines(obj);
	return fileheader() + `{\n${lines}\n}\n`;
}

function toTranslationFile(translation) {
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
						line += `(${params}): string => \`${template.replaceAll("'", "\\'")}\`,`;
					} else {
						line += `'${item.template.replaceAll("'", "\\'")}',`;
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

function toTypesFile(summary) {
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
export type Language = '${summary.languages.join("' | '")}' | string;

export interface Translation {
${toLines(summary.items)}
}
`
	);
}
