import { sveltekit } from '@sveltejs/kit/vite';
import i18n from '../..';

const config = {
	plugins: [i18n(), sveltekit()],
};

export default config;
