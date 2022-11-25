import fileheader from '../assets/fileheader';
import { Summary } from '../types';

export function toIndexFile(summary: Summary, folder: string, defaultLanguage?: string): string {
	defaultLanguage =
		defaultLanguage && summary.languages.includes(defaultLanguage)
			? defaultLanguage
			: summary.languages[0];
	return (
		fileheader() +
		`
import { writable, derived, type Writable } from 'svelte/store';
import type { Language, Translation } from './types';
import defaultLanguage from './${folder}/${defaultLanguage}';

export const availableLanguages: Language[] = ['${summary.languages.join("', '")}'];

export const selectedLanguage = writable('${defaultLanguage}');

const translations: {[key: string]: Translation} = {
	'${defaultLanguage}': defaultLanguage
};

export const t = derived([selectedLanguage], ([$lang]) => {
	if(translations[$lang]) return translations[$lang];
	if(!availableLanguages.includes($lang)) {
		console.warn('language', $lang, 'is not available');
		return translations['${defaultLanguage}'];
	}
	translations[$lang] = await import(/* @vite-ignore */ './${folder}/' + $lang);
	return translations[$lang];
});
`
	);
}
