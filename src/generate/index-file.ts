import fileheader from '../assets/fileheader';
import { Summary } from '../types';

export function toIndexFile(summary: Summary, folder: string): string {
	return (
		fileheader() +
		`
import { writable, derived, type Writable } from 'svelte/store';
import type { Language, Translation } from './types';

export const availableLanguages: Language[] = ['${summary.languages.join("', '")}'];

const selected = writable('');

let translation: Writable<Translation | null> = writable(null);

export async function setLanguage(language: Language) {
	const translation = await import('./${folder}/' + language);
	selected.set(language);
	translation.set(translation);
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
