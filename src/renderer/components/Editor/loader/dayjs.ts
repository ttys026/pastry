import * as monaco from 'monaco-editor';

const dayjsType = require('!!raw-loader!./lib/dayjs.d.ts');
// set modified dayjs types
monaco.languages.typescript.javascriptDefaults.addExtraLib(
  dayjsType.default,
  '@types/dayjs/index.d.ts'
);

// set lodash as alias
monaco.languages.typescript.javascriptDefaults.addExtraLib(
  `declare const moment: typeof dayjs`,
  '@types/dayjs/alias.d.ts'
);
