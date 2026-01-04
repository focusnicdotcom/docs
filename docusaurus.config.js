// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {
	themes as prismThemes
} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: 'Focusnic Docs',
	tagline: '',
	favicon: 'img/favicon.ico',
	onBrokenLinks: 'log',
	onBrokenMarkdownLinks: 'warn',

	// Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
	future: {
		v4: true, // Improve compatibility with the upcoming Docusaurus v4
	},

	// Set the production url of your site here
	url: 'https://docs.focusnic.com',
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: '/',

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: 'facebook', // Usually your GitHub org/user name.
	projectName: 'docusaurus', // Usually your repo name.

	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".

	i18n: {
		defaultLocale: 'id',
		locales: ['id','en'],
		localeConfigs: {
			id: {
				label: 'Bahasa Indonesia',
				htmlLang: 'id-ID',
			},
			en: {
				label: 'English',
				htmlLang: 'en-US',
				path: 'en',
			},
		},
	},

	presets: [
		[
			'classic',
			/** @type {import('@docusaurus/preset-classic').Options} */
			({
				docs: {
					sidebarPath: './sidebars.js',
					routeBasePath: '/', // Ini membuat docs menjadi halaman utama
					showLastUpdateAuthor: false,
					showLastUpdateTime: true,
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					// editUrl:'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
				},
				gtag: {
					trackingID: 'G-0JHRREMYH6',
					anonymizeIP: true,
				},
				blog: false, // Menonaktifkan blog
				theme: {
					customCss: './src/css/custom.css',
				},
			}),
		],
	],
	// Plugins
	themes: [
		[
			require.resolve('@easyops-cn/docusaurus-search-local'),
			{
				hashed: true,
				highlightSearchTermsOnTargetPage: true,
				explicitSearchResultPath: true,
				indexDocs: true, // Aktifkan jika Anda menggunakan dokumentasi
				indexBlog: false, // Nonaktifkan jika blog tidak digunakan
				docsRouteBasePath: "/",
			},
		],
	],
	// Plugins
	themeConfig: ({
		// SEO
		metadata: [{
				name: 'keywords',
				content: 'tutorial, linux'
			},
			{
				name: 'twitter:card',
				content: 'summary_large_image'
			},
		],
		// SEO

		// Replace with your project's social card
		tableOfContents: {
			minHeadingLevel: 2,
			maxHeadingLevel: 5,
		},
		image: 'img/docusaurus-social-card.jpg',
		navbar: {
			//title: 'My Site',
			logo: {
				alt: 'Focusnic',
				src: 'img/logo-color.png',
			},
			items: [{
					type: 'docSidebar',
					sidebarId: 'tutorialSidebar',
					position: 'right',
					label: 'Tutorial',
					type: 'localeDropdown',
				},

						// Dropdown Menu
						{
								type: "dropdown",
								position: "left",
								label: "Managed Services",
								items: [
									{
									label: "cPanel/WHM",
									href: 'https://focusnic.com/manage-cpanel',
									},
									{
									label: "Plesk",
									href: 'https://focusnic.com/manage-plesk',
									},
									{
									label: "WHMCS",
									href: 'https://focusnic.com/manage-whmcs',
									},
									{
									label: "Open Source Panel",
									href: 'https://focusnic.com/manage-free-panel',
									},
								],
						},
						//Dropdown Menu

                                {
                                    href: 'https://focusnic.com/vps',
                                    label: 'VPS',
                                    position: 'left'
                                },
                                {
                                    href: 'https://focusnic.com/blog',
                                    label: 'Blog',
                                    position: 'left'
                                },
			],
		},
		footer: {
			style: 'dark',
			copyright: `Copyright © ${new Date().getFullYear()} Focusnic.`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
	}),
};

export default config;
