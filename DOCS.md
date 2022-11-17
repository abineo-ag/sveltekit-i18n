# Installation

Install `sveltekit-i18n` as a dev dependency.

```sh
npm install --save-dev @rokkett/sveltekit-i18n
```

## Vite

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import i18n from '@rokkett/sveltekit-i18n';

export default {
	plugins: [i18n(), sveltekit()],
};
```

## Rollup

**If possible, use vite as build tool. Vite uses rollup under the hood.**

```js
// THIS CODE IS UNTESTED, USE WITH CAUSION!
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import i18n from '@rokkett/sveltekit-i18n';

export default {
	input: 'src/main.js',
	output: {
		file: 'public/build/bundle.js',
		format: 'iife',
		name: 'app',
	},
	plugins: [
		i18n(),
		svelte({
			include: 'src/**/*.svelte',
		}),
		resolve({ browser: true }),
	],
};
```

# Configuration

To configure the behaviour of `sveltekit-i18n`, pass in a config object as argument.

```ts
i18n({
	/* options go here */
});
```

## Options

```ts
interface PluginOptions {
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
```

## Default options

```ts
const defaultOptions: PluginOptions = {
	src: './src/lib/i18n/src',
	out: './src/lib/i18n',
	folder: 'dist',
	defaultParamType: 'string',
	createGitignore: true,
	createSummary: true,
};
```

# Input format

`sveltekit-i18n` takes JSON or JSONC files from the `src` directory as input,
and outputs o collection of typed typescript files into the `out` and `out/folder` directory.

For simple translated text, use the following syntax:

```jsonc
// src/i18n/src/de-CH.json
{
	"dashboard": "Übersicht",
	"nested": {
		"info": "Nicht gefunden!"
	}
}
```

**Output:**

```ts
const translation: Translation = {
	dashboard: 'Übersicht',
	nested: {
		info: 'Nicht gefunden!',
	},
};
```

The JSON keys get mapped to the outputed typescript, so only use valid javascript variable names as keys.

## Parameter

In addition to simple string, you can add parameters to your translations:

```jsonc
// src/i18n/src/de-CH.json
{
	"not_found": "{thing} konnte nicht gefunden werden",
	"invalid": "{input:number} ist unglütig, { input: number } ist zu klein"
}
```

**Output:**

```ts
const translation: Translation = {
	not_found: (thing: string) => `${thing} konnte nicht gefunden werden`,
	invalid: (input: number): string => `${input} ist unglütig, ${input} ist zu klein`,
};
```
