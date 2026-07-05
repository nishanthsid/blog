import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: "Nishanth's Blog",
  tagline: "Notes on Linux, operating systems, and Ninux",

  favicon: "img/favicon.ico",

  url: "https://nishanthsid.github.io",
  baseUrl: "/blog/",

  organizationName: "nishanthsid",
  projectName: "blog",

  trailingSlash: false,

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  future: {
    v4: true,
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "docs",
          editUrl:
            "https://github.com/nishanthsid/blog/tree/main/",
        },
        blog: {
          showReadingTime: true,
          blogSidebarCount: "ALL",
          blogSidebarTitle: "All Posts",
          editUrl:
            "https://github.com/nishanthsid/blog/tree/main/",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/social-card.png",

    navbar: {
      title: "Nishanth",
      logo: {
        alt: "Nishanth Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Docs",
        },
        {
          to: "/blog",
          label: "Blog",
          position: "left",
        },
        {
          href: "https://github.com/nishanthsid",
          label: "GitHub",
          position: "right",
        },
      ],
    },

    footer: {
      style: "dark",
      copyright: `© ${new Date().getFullYear()} Nishanth S D. Built with Docusaurus.`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        "bash",
        "c",
        "cpp",
        "nasm",
        "cmake",
        "diff",
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;