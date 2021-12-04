import * as monaco from 'monaco-editor';

const lodashTypes = require('!!raw-loader!./lib/lodash.d.ts');

// load lodash types
monaco.languages.typescript.javascriptDefaults.addExtraLib(
  lodashTypes.default,
  '@types/lodash/index.d.ts'
);

// set lodash as alias
monaco.languages.typescript.javascriptDefaults.addExtraLib(
  `declare const lodash: _.LoDashStatic`,
  '@types/lodash/alias.d.ts'
);
