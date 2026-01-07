import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json';

export default defineConfig(({ mode }) => {
	return {
		base: mode === 'production' ? './' : '/',
		plugins: [
			tailwindcss(),
			VitePWA({
				workbox: {
					globPatterns: ['**/*.{js,css,html,png,svg,webmanifest,woff2}'],
					navigateFallback: 'index.html',
				},
				includeAssets: ['fonts/*.woff2', '*.png', 'img/*.svg'],
				registerType: 'autoUpdate',
				manifest: {
					name: pkg.displayName,
					short_name: pkg.displayName,
					theme_color: '#676975',
					background_color: '#676975',
					display: 'standalone',
					start_url: '.',
					share_target: undefined,
					scope: '.',
					description: pkg.description,
					orientation: 'any',
					icons: [
						{
							src: './favicon-32x32.png',
							sizes: '32x32',
							purpose: 'any',
							type: 'image/png',
						},
						{
							src: './favicon-48x48.png',
							sizes: '48x48',
							purpose: 'any',
							type: 'image/png',
						},
						{
							src: './favicon-192x192.png',
							sizes: '192x192',
							purpose: 'any',
							type: 'image/png',
						},
						{
							src: './favicon-167x167.png',
							sizes: '167x167',
							purpose: 'any',
							type: 'image/png',
						},
						{
							src: './favicon-180x180.png',
							sizes: '180x180',
							purpose: 'any',
							type: 'image/png',
						},
						{
							src: './favicon-512x512.png',
							sizes: '512x512',
							purpose: 'any',
							type: 'image/png',
						},
						{
							src: './favicon-48x48-maskable.png',
							sizes: '48x48',
							purpose: 'maskable',
							type: 'image/png',
						},
						{
							src: './favicon-192x192-maskable.png',
							sizes: '192x192',
							purpose: 'maskable',
							type: 'image/png',
						},
						{
							src: './favicon-512x512-maskable.png',
							sizes: '512x512',
							purpose: 'maskable',
							type: 'image/png',
						},
					],
				},
			}),
		],
	};
});
