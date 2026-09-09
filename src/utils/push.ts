/* eslint-disable no-console */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd, exit } from 'node:process'

const root = cwd()

function runGit(args: string[]) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim()
}

function getTitle(filePath: string) {
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/)

  if (lines[0]?.trim() !== '---') {
    return null
  }

  const titleLine = lines
    .slice(1, lines.indexOf('---', 1))
    .find(line => /^title\s*:/.test(line))

  if (!titleLine) {
    return null
  }

  return titleLine
    .replace(/^title\s*:\s*/, '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
}

function getNewMdxFiles() {
  const output = runGit([
    'status',
    '--porcelain',
    '--',
    'blog',
  ])

  return output
    .split('\n')
    .filter(Boolean)
    .filter(line => line.startsWith('?? '))
    .map(line => line.slice(3).trim())
    .filter(file => file.toLowerCase().endsWith('.mdx'))
}

const files = getNewMdxFiles()

if (files.length === 0) {
  console.log('ℹ️ 没有发现新增的 MDX 文件')
  exit(0)
}

console.log(`📝 发现 ${files.length} 个新增 MDX 文件:\n`)

for (const file of files) {
  console.log(`  ${file}`)
}

for (const file of files) {
  const absolutePath = join(root, file)
  const title = getTitle(absolutePath)

  if (!title) {
    console.error(`\n❌ 无法从 ${file} 中找到 title`)
    exit(1)
  }

  const commitMessage = `docs: ${title}`

  console.log(`\n📦 ${commitMessage}`)

  execFileSync('git', ['add', '--', file], {
    cwd: root,
    stdio: 'inherit',
  })

  execFileSync('git', ['commit', '-m', commitMessage], {
    cwd: root,
    stdio: 'inherit',
  })
}

console.log('\n🚀 所有 MDX 已提交，开始推送...\n')

execFileSync('git', ['push'], {
  cwd: root,
  stdio: 'inherit',
})

console.log('\n✅ 所有 MDX 已推送到 GitHub')
