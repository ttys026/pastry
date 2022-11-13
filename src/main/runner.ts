import vm from 'vm';
import { app } from 'electron';
import { transpile } from 'typescript';
import { getModulesDir } from './main';
import { log } from './controller';
import { builtinModules } from 'module';

const getFormatedPath = () => {
  const path = getModulesDir();
  if (path.startsWith('~')) {
    return `${app.getPath('home')}${path.slice(1)}`;
  }
  return path;
};

export const run = async (code: string) => {
  try {
    const vmModule = {
      exports: {
        default: (..._: any[]) => '',
      },
    };
    const context = {
      require: (name: string) => {
        if (builtinModules.includes(name) || name.startsWith('node:')) {
          return require(name);
        }
        return require(`${getFormatedPath()}/${name}`);
      },
      console: Object.keys(console).reduce((acc, key) => {
        acc[key] = (...args: string[]) =>
          log(key as keyof Console, `script console.${key}:`, args);
        return acc;
      }, {}),
      exports: vmModule.exports,
      module: vmModule,
    };
    const result = transpile(code);
    const script = new vm.Script(result);
    await script.runInContext(vm.createContext(context));
    return context.exports.default;
  } catch (e) {
    return () => e.message;
  }
};
