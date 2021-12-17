/** @format */

import http from 'http'
import path, {extname, join} from 'path'
import {readFileSync} from 'fs'
import getEtag from 'etag'

export const appRoot = process.cwd()

export const joinPath = (...paths) => {
  return path.resolve(appRoot, ...paths)
}

const server = http.createServer(async (req, res) => {
  const fileType = extname(req.url)
  console.log('url ' + req.url)
  // if (res.writableEnded) {
  //   return
  // }
  // ico file
  if (fileType === '.ico') {
    res.setHeader('Content-Type', 'image/x-icon')
    const file = readFileSync('./favicon.ico')
    res.end(file)
    return
  }

  // js
  if (fileType === '.js') {
   
    console.log(res.writableEnded);
    res.setHeader('Content-Type', 'application/javascript')
    res.setHeader('Cache-Control', 'no-cache')
    const file = readFileSync('./main.js','utf-8')
    const etag = getEtag(file, {weak: true})
    if (req.headers['if-none-match'] === etag) {
      res.statusCode = 304
      console.log(304);
      return res.end(null)
    }
    res.setHeader('Etag', etag)

    console.log(etag)
    console.log(req.headers['if-none-match']);
    console.log(Object.prototype.toString.call(file));
    res.end(file)
    return
  }

  // css
  if (fileType === '.css') {
    res.setHeader('Cache-Control', 'max-age=31536000,immutable')
    res.setHeader('Content-Type', 'text/css')
    const file = readFileSync('./style.css')
    res.end(file)
    return
  }

  // html
  if (req.url === '/') {
    handleHtml(req, res)
    return
  }
  //  default html
  return handleHtml(req, res)
})

server.listen(8080)
console.log('Your server available at http://localhost:8080')

// 处理html文件
function handleHtml(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  const content = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <link rel="stylesheet" href="./style.css">
    </head>
    <body>
    </body>
    <script src="./main.js" type="module"></script>
    </html>
    `
  // 添加
  res.end(content)
  return false
}
