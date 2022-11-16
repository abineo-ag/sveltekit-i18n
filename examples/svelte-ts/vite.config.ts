import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import plugin from '../../dist';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [plugin(), svelte()],
});
