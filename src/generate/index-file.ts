import fileheader from '../assets/fileheader';
import { Summary } from '../types';

export function toIndexFile(summary: Summary, folder: string): string {
	return (
		fileheader() +
		`
import { writable, derived, type Writable } from 'svelte/store';
import type { Language, Translation } from './types';

export const availableLanguages = ['${summary.languages.join("', '")}'];

export const selectedLanguage = writable('');

let translation: Writable<Translation | null> = writable(null);

export async function setLanguage(language: Language) {
	const translation = await import('./${folder}/' + language);
	selectedLanguage.set(language);
	translation.set(translation);
}

export const t = derived([translation], ([$translation]) => {
	return $translation;
});
`
		// TODO: implement utillity to select most fitting language from simple string or from Accept-Language header
	);
}
