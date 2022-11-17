import fileheader from '../assets/fileheader';
import { Summary } from '../types';

export function toIndexFile(summary: Summary, folder: string, defaultLanguage?: string): string {
	defaultLanguage = summary.languages.includes(defaultLanguage)
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
	const newTranslation = await import('./${folder}/' + language);
	selected.set(language);
	translation.set(newTranslation);
}

export const t = derived([translation], ([$translation]) => {
	return $translation;
});

export const selectedLanguages = derived([selected], ([$selected]) => {
	return $selected;
});
`
		// TODO: implement utillity to select most fitting language from simple string or from Accept-Language header
	);
}
