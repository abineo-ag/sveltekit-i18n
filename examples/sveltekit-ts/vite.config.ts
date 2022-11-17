import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import plugin from '../../dist';

const config: UserConfig = {
	plugins: [plugin(), sveltekit()],
};

export default config;
