/* eslint-disable antfu/no-top-level-await */
/* eslint-disable no-console */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { argv, cwd } from 'node:process'

const [, , filename] = argv

if (!filename) {
  throw new Error('Usage: pnpm new-post <filename>')
}

const root = cwd()
const blogDir = path.join(root, 'src', 'content', 'blog')
const filePath = path.join(blogDir, `${filename}.mdx`)

const content = `---
title: ${filename}
description: ""
published: ${new Date().toISOString().slice(0, 10)}
tags: []
---

`

await mkdir(blogDir, { recursive: true })

await writeFile(filePath, content, {
  encoding: 'utf8',
  flag: 'wx',
})

console.log(`Created: ${path.relative(root, filePath)}`)
