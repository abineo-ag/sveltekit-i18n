import { sveltekit } from '@sveltejs/kit/vite';
const i18n = require('../../js/index.js');

const config = {
	plugins: [i18n(), sveltekit()],
};

export default config;
