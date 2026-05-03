const repeatedSlashes = /\/+/g

export function normalizeFilePath(path: string): string {
  const trimmedPath = path.trim()

  if (trimmedPath.length === 0) {
    throw new Error('File path cannot be empty.')
  }

  const normalizedPath = `/${trimmedPath}`
    .replace(repeatedSlashes, '/')
    .replace(/\/$/, '')

  if (normalizedPath === '') {
    throw new Error('File path cannot be empty.')
  }

  const segments = normalizedPath.split('/').filter(Boolean)

  if (segments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error('File path cannot contain relative segments.')
  }

  return normalizedPath
}

export function getFileName(path: string): string {
  const normalizedPath = normalizeFilePath(path)
  return normalizedPath.slice(normalizedPath.lastIndexOf('/') + 1)
}
