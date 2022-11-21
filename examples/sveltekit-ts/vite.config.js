import { sveltekit } from '@sveltejs/kit/vite';
import i18n from '../..';

const config = {
	plugins: [sveltekit(), i18n()],
};

export default config;
