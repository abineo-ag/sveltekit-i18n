import fileheader from '../assets/fileheader';
import { Summary } from '../types';

export function toIndexFile(summary: Summary): string {
	// TODO
	return (
		fileheader() +
		`
export * from './types';
`
	);
}
