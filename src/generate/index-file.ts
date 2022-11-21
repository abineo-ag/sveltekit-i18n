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

const selected = writable('${defaultLanguage}');

let translation: Writable<Translation> = writable(defaultLanguage);

export async function setLanguage(language: Language) {
	let lang = language;
	if(!availableLanguages.includes(language)) {
		lang = '${defaultLanguage}';
		console.warn('language', language, 'is not available')
	}
	const newTranslation = await import('./${folder}/' + lang);
	selected.set(lang);
	translation.set(newTranslation);
}

export const t = derived([translation], ([$translation]) => {
	return $translation;
});

export const selectedLanguage = derived([selected], ([$selected]) => {
	return $selected;
});
`
	);
}
 