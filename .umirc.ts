import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'Pastry',
  favicon:
    'https://cdn-ty.oss-cn-hongkong.aliyuncs.com/128x128.png',
  logo: "/images/logo.svg",
  outputPath: 'docs-dist',
  mode: 'site',
  styles: [`.__dumi-default-search { display: none !important; }`],
  navs: [
    null, // A null value means to retain the conventionally generated navigation and only do incremental configuration
    {
      title: 'GitHub',
      path: 'https://github.com/ttys026/pastry',
    },
  ],
  404: true,
  // more config: https://d.umijs.org/config
});
