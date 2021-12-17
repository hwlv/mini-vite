/**
 * @format
 * @Author: hongwang.lv
 * @Date: 2021-08-08 14:47:42
 * @Description:
 */

import http from 'http'
import {readFileSync} from 'fs'
import path, {extname, join} from 'path'
import getEtag from 'etag'
import chalk from 'chalk'
import {transformCSS} from './transformCSS'
import {joinPath, appRoot} from './utils'
import {htmlPath, pkgs} from '../config'
import {optmize as runOptimize} from './optmize'
import {transformCode, transformJS} from './transformJs'

const server = http.createServer(async (req, res) => {
  const fileType = extname(req.url)
  const filePath = joinPath(req.url.slice(1))
  //   console.log('req.url: ' + req.url)
  //   console.log(chalk.red('fileType: ' + fileType))
  //   console.log(chalk.red('filePath: ' + filePath))
  //   console.log({extname: extname(req.url)})
  if (res.writableEnded) {
    return
  }

  // html
  if (req.url === '/') {
    handleHtml(req, res)
    return
  }

  // @vite/client
  if (req.url.startsWith('/@vite/client')) {
    res.setHeader('Content-Type', 'application/javascript')
    res.end(
      transformCode({
        code: readFileSync(join(__dirname, 'client.ts'), 'utf-8')
      }).code
    )
  }

  // ico file
  if (extname(req.url) === '.ico') {
    res.setHeader('Content-Type', 'image/x-icon')
    const file = readFileSync('public/favicon.ico')
    res.end(file)
    return
  }

  // css
  if (extname(req.url) === '.css') {
    res.setHeader('Content-Type', 'application/javascript')
    res.setHeader('Cache-Control', 'max-age=31536000,immutable')

    const resCss = transformCSS({
      path: req.url,
      code: readFileSync(join(appRoot, req.url.slice(1)), 'utf-8')
    })
    const etag = getEtag(resCss, {weak: true})
    if (req.headers['if-none-match'] === etag) {
      res.statusCode = 304
      return res.end()
    }

    res.setHeader('Etag', etag)
    res.end(resCss)
    return
  }

  // node_modules
  if (req.url.startsWith('/node_modules')) {
    // allow browser to cache npm deps!
    res.setHeader('Cache-Control', 'max-age=31536000,immutable')
    res.setHeader('Content-Type', 'application/javascript')
    res.end(readFileSync(joinPath(req.url.slice(1))))
    return
  }

  // src
  if (req.url.startsWith('/src')) {
    let content = readFileSync(joinPath(req.url.slice(1)), 'utf-8')
    // set etag
    const etag = getEtag(content, {weak: true})

    console.log(chalk.magenta('etag-------------------'))
    console.log(req.headers['if-none-match'])
    console.log(etag)
    console.log(req.headers['if-none-match'] === etag)
    if (req.headers['if-none-match'] === etag) {
      res.statusCode = 304
      console.log(
        '%c set 304.。。',
        'font-size:20px;color:blue;background:yellow;'
      )

      return res.end()
    }

    console.log('object.....')
    res.setHeader('Etag', etag)
    res.statusCode = 200
    res.setHeader('Cache-Control', 'no-cache')

    if (extname(req.url) === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml')
      res.end(content)
      return
    } else {
      res.setHeader('Content-Type', 'application/javascript')
      res.end(
        transformJS({
          appRoot,
          path: req.url,
          code: content
        }).code
      )
      return
    }
  }

  //  default html
  console.log('%c default....','font-size:20px;color:blue;background:yellow;')
  return handleHtml(req, res)
})

// 处理html文件
function handleHtml(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  let content = readFileSync(joinPath(htmlPath), 'utf-8')
  const script = `
        <script>
            window.process = {env:{ NODE_ENV:'development'}}
        </script>
    `
  // 添加
  content = content.replace(/<head>/, `$&${script}`)
  res.end(content)
  return false
}

async function createServer() {
  //  overwrite listen to run optimizer before server start
  const listen = server.listen.bind(server)
  server.listen = async (port, ...args) => {
    // 预构建
    await runOptimize({pkgs})
    return listen(port, ...args)
  }
  await server.listen(8000)
  console.log('Your server available at http://localhost:8000/layout/user/role')
}

createServer()
