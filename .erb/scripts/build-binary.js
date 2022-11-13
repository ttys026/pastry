import { execSync } from 'child_process';
import { copyFileSync, rmSync } from 'fs-extra';
import path from 'path';

execSync('swift build -c release --arch arm64 --arch x86_64', { cwd: path.join(__dirname, '../../src/binary/macocr') });
rmSync('./release/lib/macocr');
copyFileSync('./src/binary/macocr/.build/apple/Products/Release/macocr', './release/lib/macocr');
