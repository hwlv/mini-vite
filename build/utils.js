/** @format */

import fs from 'fs'
import path, {extname} from 'path'
import chalk from 'chalk'

// 项目根路径
export const appRoot = process.cwd()

export const joinPath = (...paths) => {
  return path.resolve(appRoot, ...paths)
}

export const readFile = path => {
  return fs.readFileSync(path, 'utf-8')
}

// export const log = line => {
//   fs.appendFileSync('./log.md', line + '\n')
// }

export const cred = str => {
  console.log(chalk.red(str))
}

export const cgreen = str => {
  console.log(chalk.green(str))
}

export const cyellow = str => {
  console.log(chalk.yellowBright(str))
}

export const cacheDir = path.resolve(appRoot, 'node_modules', '.cache')


export function resolveFrom(id, basedir) {
  return resolve.sync(id, {
    basedir
  })
}

export function loadPackageData(pkgPath) {
  const data = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const pkgDir = path.dirname(pkgPath)
  return {
    dir: pkgDir,
    data
  }
}