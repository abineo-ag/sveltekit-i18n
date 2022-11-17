import fs from 'fs';
import { debounce } from 'lodash-es';
import transpiler from './transpiler';

export interface PluginOptions {
	/** The directory containing your JSON-Files */
	src: string;
	/** The directory to put the generated `index.ts` */
	out: string;
	/** The folder name inside the `out` directory to put the generated `<language>.ts` files */
	folder: string;
	/** The default type assigned to a parameter inside a resource string */
	defaultParamType: string;
	/** Create gitignore file */
	createGitignore: boolean;
	/** Create summary file in json format containing errors or missing translations */
	createSummary: boolean;
	/** The language that gets selected per default */
	defaultLanguage?: string;
}

export const defaultOptions: PluginOptions = {
	src: './src/lib/i18n/src',
	out: './src/lib/i18n',
	folder: 'dist',
	defaultParamType: 'string',
	createGitignore: true,
	createSummary: true,
};

export function plugin(opts: Partial<PluginOptions> = defaultOptions) {
	const options = { ...defaultOptions, ...opts };
	let watcher: fs.FSWatcher;

	return {
		name: 'rokkett-svelte-i18n',
		buildStart() {
			const { watchDir, transpile } = transpiler(options);
			watcher = fs.watch(watchDir, { recursive: false }, debounce(transpile, 2000));
		},
		buildEnd() {
			watcher.close();
		},
	};
}
