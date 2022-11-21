import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import i18n from '../..';

const config: UserConfig = {
	plugins: [i18n(), sveltekit()],
};

export default config;
