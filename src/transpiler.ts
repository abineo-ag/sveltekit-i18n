import fs from 'fs';
import path from 'path';
import { index, translation } from './generate';
import { parse, configure, toLanguageCode, LanguageModel, mergeResources } from './parser';
import { PluginOptions } from './plugin';

export default function (options: PluginOptions) {
	const srcDir = path.join(...options.src.split(/[\\\/]+/g));
	const outDir = path.join(...options.out.split(/[\\\/]+/g));
	const tsOutDir = path.join(outDir, options.folder);

	if (!fs.existsSync(srcDir)) throw `options.src: '${options.src}' must exists`;
	if (!fs.statSync(srcDir).isDirectory())
		throw `options.src: '${options.src}' must be a directory`;
	fs.mkdirSync(tsOutDir, { recursive: true });

	if (options._debug) {
		console.debug({ srcDir, outDir, tsOutDir });
	}

	configure(options.defaultParamType, options._debug);

	function createModel(filename: string) {
		const content = fs.readFileSync(path.join(srcDir, filename), { encoding: 'utf8' });
		return parse(toLanguageCode(filename), content);
	}

	function transpile() {
		const entries = fs.readdirSync(srcDir);
		const models = entries.map((filename) => createModel(filename));
		const combined: LanguageModel = {
			lang: '*',
			resources: mergeResources(models.map((model) => model.resources).flat()),
		};
		const files: { [name: string]: string } = {};
		files['index.ts'] = index(combined);
		models.forEach((model) => {
			files[path.join(tsOutDir, `${model.lang}.ts`)] = translation(model, combined);
		});

		// TODO: write all files
	}

	return { watchDir: srcDir, transpile };
}
