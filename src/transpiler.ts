import fs from 'fs';
import path from 'path';
import { toGitignore } from './generate/gitignore';
import { toIndexFile } from './generate/index-file';
import { toSummaryFile } from './generate/summary';
import { toTranslationFile } from './generate/translation';
import { toTypesFile } from './generate/types';
import { parse, configure, toLanguageCode, toSummary } from './parser';
import { PluginOptions } from './plugin';
import { Summary, Translation } from './types';

export default function (options: PluginOptions) {
	const srcDir = path.join(...options.src.split(/[\\\/]+/g));
	const outDir = path.join(...options.out.split(/[\\\/]+/g));
	const tsOutDir = path.join(outDir, options.folder);

	if (!fs.existsSync(srcDir)) throw `options.src: '${options.src}' must exists`;
	if (!fs.statSync(srcDir).isDirectory())
		throw `options.src: '${options.src}' must be a directory`;

	configure(options.defaultParamType);

	function parseFile(filename: string): Translation {
		const content = fs.readFileSync(path.join(srcDir, filename), { encoding: 'utf8' });
		return parse(toLanguageCode(filename), content);
	}

	function transpile() {
		const entries = fs.readdirSync(srcDir);
		const translations = entries.map((filename) => parseFile(filename));
		const summary: Summary = toSummary(translations);
		const files: [file: string, content: string][] = [
			[path.join(outDir, 'types.ts'), toTypesFile(summary)],
			[path.join(outDir, 'index.ts'), toIndexFile(summary)],
		];
		if (options.createGitignore) {
			files.push([path.join(outDir, '.gitignore'), toGitignore(options.folder)]);
		}
		if (options.createSummary) {
			files.push([path.join(outDir, 'summary.json'), toSummaryFile(summary)]);
		}
		translations.forEach((translation) => {
			[
				path.join(tsOutDir, `${translation.lang}.ts`),
				toTranslationFile(translation, summary),
			];
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
