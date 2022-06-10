import { rmSync } from 'fs';
import { join, resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron/renderer';
import pkg from './package.json';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

rmSync(join(__dirname, 'dist'), { recursive: true, force: true }); // v14.14.0

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		// https://github.com/electron-vite/electron-vite-vue/issues/107
		// 异步路由加载css有问题,所以暂时禁用
		// It works!
		cssCodeSplit: false,
	},
	resolve: {
		alias: {
			'@': join(__dirname, 'src'),
			styles: join(__dirname, 'src/assets/styles'),
		},
	},
	css: {
		preprocessorOptions: {
			css: { 
				charset: false, // [WARNING] "@charset" must be the first rule in the file
			 },
			scss: {
				charset: false, // [WARNING] "@charset" must be the first rule in the file
				additionalData: `@use "styles/element/index.scss" as *;`,
			},
		},
	},
	plugins: [
		vue(),
		electron({
			main: {
				entry: 'electron/main/index.ts',
				vite: {
					build: {
						sourcemap: false,
						outDir: 'dist/electron/main',
					},
				},
			},
			preload: {
				input: {
					// You can configure multiple preload scripts here
					splash: join(__dirname, 'electron/preload/splash.ts'),
				},
				vite: {
					build: {
						// For debug
						sourcemap: 'inline',
						outDir: 'dist/electron/preload',
					},
				},
			},
		}),
		// Enables use of Node.js API in the Renderer-process
		renderer(),
		AutoImport({
			// 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
			imports: ['vue', 'vue-router', 'pinia'],
			resolvers: [ElementPlusResolver()],
			dts: resolve(__dirname, 'auto-imports.d.ts'),
		}),
		Components({
			resolvers: [
				ElementPlusResolver({
					importStyle: 'sass',
				}),
			],
			dts: 'src/components.d.ts',
		}),
		// ElementPlus({ useSource: true }),
	],
	server: {
		host: pkg.env.VITE_DEV_SERVER_HOST,
		port: pkg.env.VITE_DEV_SERVER_PORT,
	},
});
