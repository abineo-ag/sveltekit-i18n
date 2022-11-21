import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFile } from 'fs';
import path from 'path';
import { toGitignore } from './generate/gitignore';
import { toIndexFile } from './generate/index-file';
import { toSummaryFile } from './generate/summary';
import { toTranslationFile } from './generate/translation';
import { toTypesFile } from './generate/types';
import { parse, configure, toLanguageCode, toSummary } from './parser';

// https://regex101.com/r/duqj7S/1
const VALID_LANG = /^[a-z]{2,}(-[a-z]{2,})*$/gi; //new RegExp(/^[a-z]{2,}(-[a-z]{2,})*$/gi);

export default function (options) {
	const srcDir = path.join(...options.src.split(/[\\\/]+/g));
	const outDir = path.join(...options.out.split(/[\\\/]+/g));
	const tsOutDir = path.join(outDir, options.folder);

	if (!existsSync(srcDir)) throw `options.src: '${options.src}' must exists`;
	if (!statSync(srcDir).isDirectory()) throw `options.src: '${options.src}' must be a directory`;

	configure(options.defaultParamType);

	function parseFile(filename) {
		const content = readFileSync(path.join(srcDir, filename), { encoding: 'utf8' });
		return parse(toLanguageCode(filename), content);
	}

	function transpile() {
		const entries = readdirSync(srcDir).filter((file) => {
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
		rmSync(tsOutDir, { recursive: true, force: true });
		mkdirSync(tsOutDir, { recursive: true });
		files.forEach(([file, content]) => {
			writeFile(file, content, 'utf8', (err) => {
				err && console.error(err);
			});
		});
	}

	transpile();

	return { watchDir: srcDir, transpile };
}
