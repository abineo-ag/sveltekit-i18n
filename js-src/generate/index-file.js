import fileheader from '../assets/fileheader';

export function toIndexFile(summary, folder, defaultLanguage) {
	defaultLanguage =
		defaultLanguage && summary.languages.includes(defaultLanguage)
			? defaultLanguage
			: summary.languages[0];
	return (
		fileheader() +
		`
import { writable, derived, type Writable } from 'svelte/store';
import type { Language, Translation } from './types';
import defaultTranslation from './${folder}/${defaultLanguage}';

export const availableLanguages: Language[] = ['${summary.languages.join("', '")}'];

export const selectedLanguage = writable('${defaultLanguage}');

const dictionary: {[key: string]: Translation} = {
	'${defaultLanguage}': defaultTranslation
};
const translation: Writable<Translation> = writable(defaultTranslation);

selectedLanguage.subscribe(async (lang) => {
	if(dictionary[lang]) translation.set(dictionary[lang]);
	if(!availableLanguages.includes(lang)) {
		console.warn('language', lang, 'is not available');
		translation.set(dictionary['${defaultLanguage}']);
	}
	dictionary[lang] = await import(/* @vite-ignore */ './${folder}/' + lang);
	translation.set(dictionary[lang]);
});

export const t = derived([translation], ([$translation]) => {
	return $translation;
});
`
	);
}
