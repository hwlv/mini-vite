
import fs from 'fs';
import path, { extname } from 'path';
import chalk from 'chalk'
import resolve from 'resolve';

// 项目根路径
export const appRoot = process.cwd()

export const cacheDir = path.resolve(appRoot, 'node_modules/.cache');

export const joinPath = (...paths: string[]) => {
  return path.resolve(appRoot, ...paths)
}

export const readFile = (path: string) => {
  return fs.readFileSync(path, "utf-8");
}

export const emptyDir = (dir: string) => {
  return fs.rmSync(dir, { recursive: true, force: true })
}

export function loadPackageData(pkgPath: string) {
  const data = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const pkgDir = path.dirname(pkgPath)
  return {
    dir: pkgDir,
    data
  }
}

export function resolveFrom(
  id: string,
  basedir: string,
  preserveSymlinks = false,
  ssr = false
): string {
  return resolve.sync(id, {
    basedir,
    extensions: ssr ? ssrExtensions : DEFAULT_EXTENSIONS,
  })
}

export const cred = (str: unknown) => {
  console.log(chalk.red(str))
}

export const cgreen = (str: unknown) => {
  console.log(chalk.green(str))
}

export const cyellow = (str: unknown) => {
  console.log(chalk.yellowBright(str))
}
