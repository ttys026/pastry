import * as monaco from 'monaco-editor';

const nanoidTypes = require('!!raw-loader!nanoid/index.d.ts');
const axiosType = require('!!raw-loader!axios/index.d.ts');

const types = [
  {
    name: 'nanoid',
    types: nanoidTypes,
    importName: [
      'nanoid',
      'customAlphabet',
      'customRandom',
      'urlAlphabet',
      'random',
    ],
  },
  { name: 'axios', types: axiosType, importName: 'default' },
];

types.forEach((module) => {
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    `declare module "${module.name}" {
     ${module.types.default}
    }
    ${
      Array.isArray(module.importName)
        ? module.importName
            .map(
              (ele) =>
                `declare const ${ele}: typeof import('${module.name}')['${ele}'];`
            )
            .join('\n')
        : `declare const ${module.name}: typeof import('${module.name}')['${module.importName}'];`
    }
    
    `,
    `typings/${module.name}.d.ts`
  );
});
