import fs from 'fs';
import lodash from 'lodash';
import transpiler from './transpiler';

export const defaultOptions = {
	src: './src/lib/i18n/src',
	out: './src/lib/i18n',
	folder: 'dist',
	defaultParamType: 'string',
	createGitignore: true,
	createSummary: true,
};

export function plugin(opts = defaultOptions) {
	const options = { ...defaultOptions, ...opts };
	let watcher;

	return {
		name: 'rokkett-sveltekit-i18n',
		buildStart() {
			const { watchDir, transpile } = transpiler(options);
			watcher = fs.watch(watchDir, { recursive: false }, lodash.debounce(transpile, 2000));
		},
		buildEnd() {
			if (watcher && watcher.close) watcher.close();
		},
	};
}
