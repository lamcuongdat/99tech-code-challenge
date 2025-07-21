import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
	root: resolve(__dirname, 'src'),
	base: './',
	resolve: {
		alias: {
			'~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
			'~bootstrap-icons': resolve(__dirname, 'node_modules/bootstrap-icons'),
		}
	},
	server: {
		port: 3000,
		hot: true
	}
};