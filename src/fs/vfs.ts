import { inferLanguageFromPath } from './language'
import { normalizeFilePath } from './path'
import type { SerializedVfs, VfsFile, VfsMap } from './types'

export function cloneVfs(files: VfsMap): VfsMap {
  return new Map(files)
}

export function getFile(files: VfsMap, path: string): VfsFile | undefined {
  return files.get(normalizeFilePath(path))
}

export function createFile(
  files: VfsMap,
  path: string,
  content = '',
  language = inferLanguageFromPath(path),
): VfsMap {
  const normalizedPath = normalizeFilePath(path)

  if (files.has(normalizedPath)) {
    throw new Error(`File already exists: ${normalizedPath}`)
  }

  const nextFiles = cloneVfs(files)
  nextFiles.set(normalizedPath, { content, language })
  return nextFiles
}

export function updateFileContent(
  files: VfsMap,
  path: string,
  content: string,
): VfsMap {
  const normalizedPath = normalizeFilePath(path)
  const file = files.get(normalizedPath)

  if (file === undefined) {
    throw new Error(`File does not exist: ${normalizedPath}`)
  }

  const nextFiles = cloneVfs(files)
  nextFiles.set(normalizedPath, { ...file, content })
  return nextFiles
}

export function renameFile(
  files: VfsMap,
  fromPath: string,
  toPath: string,
): VfsMap {
  const normalizedFromPath = normalizeFilePath(fromPath)
  const normalizedToPath = normalizeFilePath(toPath)
  const file = files.get(normalizedFromPath)

  if (file === undefined) {
    throw new Error(`File does not exist: ${normalizedFromPath}`)
  }

  if (files.has(normalizedToPath)) {
    throw new Error(`File already exists: ${normalizedToPath}`)
  }

  const nextFiles = cloneVfs(files)
  nextFiles.delete(normalizedFromPath)
  nextFiles.set(normalizedToPath, {
    ...file,
    language: inferLanguageFromPath(normalizedToPath),
  })
  return nextFiles
}

export function deleteFile(files: VfsMap, path: string): VfsMap {
  const normalizedPath = normalizeFilePath(path)

  if (!files.has(normalizedPath)) {
    throw new Error(`File does not exist: ${normalizedPath}`)
  }

  const nextFiles = cloneVfs(files)
  nextFiles.delete(normalizedPath)
  return nextFiles
}

export function serializeVfs(files: VfsMap): SerializedVfs {
  return Object.fromEntries(files)
}

export function deserializeVfs(files: SerializedVfs): VfsMap {
  return new Map(
    Object.entries(files).map(([path, file]) => [
      normalizeFilePath(path),
      {
        content: file.content,
        language: file.language,
      },
    ]),
  )
}
