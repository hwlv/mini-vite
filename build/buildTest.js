/** @format */

import {build, transformSync} from 'esbuild'
import fs from 'fs'
import {init, parse as parseImports} from 'es-module-lexer'
import chalk from 'chalk'
import resolve from 'resolve'
import path from 'path'
// import {appRoot} from './util.js'
import {cred, transformCode, appRoot, resolveFrom} from './util.js'

// console.log(resolve.sync('react'))

async function exec() {
  // const react = '/Users/hwlv/Desktop/cli/node_modules/react/index.js'
  // const resolveObj = await import(react)
  // console.log(resolveObj)
  const {deps} = await scanImports()

  console.log(cred(deps))
}

// scan import
export async function scanImports() {
  const deps = {}
  const esbuildScanPlugin = {
    name: 'dep-scan',
    setup(build) {
      build.onLoad({filter: /\.(js|ts|tsx)/}, async args => {
        console.log(chalk.green('path:', args.path))
        const source = fs.readFileSync(args.path, 'utf8')
        console.log('内容:', source.split('\n')[0])
        if (args.path.includes('/src')) {
          console.log(chalk.yellow(args.path))
          let ext = path.extname(args.path).slice(1)
          console.log(ext)
          const ret = transformCode({
            code: source,
            loader: ext
          })

          // parse import
          await init
          const [imports, exports] = parseImports(
            ret.code,
            'optional-sourcename'
          )
          imports.forEach(specifier => {
            if (!specifier?.n.includes('/')) {
              deps[specifier.n] = resolveFrom(specifier.n, appRoot)
              // importedUrls.add(specifier.n)
              // const resolveObj =await import('react')
              // console.log(resolveObj);
            }
          })
          // console.log(parseImports(contents,'optional-sourcename'))
        }

        return {
          contents: source,
          loader: 'tsx'
        }
      })
    }
  }

  const entryPoints = `${appRoot}/examples/prebuild/src/index.tsx`

  console.log({entryPoints})

  await build({
    entryPoints: [entryPoints],
    bundle: true,
    // outfile: 'examples/prebuild/cache/index.tsx',
    format: 'esm',
    write: true,
    // metafile: true,
    splitting: true,
    outdir: 'examples/prebuild/cache',

    plugins: [esbuildScanPlugin]
  }).catch(() => process.exit(1))
  // console.log('文件路径: ')
  return {deps}
}



//
export async function optimizeDeps() {}

exec()

// importAnalysisPlugin
