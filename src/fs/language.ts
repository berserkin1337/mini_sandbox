import type { FileLanguage } from './types'

const extensionLanguages: Record<string, FileLanguage> = {
  css: 'css',
  htm: 'html',
  html: 'html',
  js: 'javascript',
  jsx: 'javascript',
  json: 'json',
  md: 'markdown',
  mjs: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
}

export function inferLanguageFromPath(path: string): FileLanguage {
  const extension = path.split('.').pop()?.toLowerCase()

  if (extension === undefined) {
    return 'plaintext'
  }

  return extensionLanguages[extension] ?? 'plaintext'
}
