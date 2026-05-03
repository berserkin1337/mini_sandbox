export { createDefaultVfs } from './defaultFiles'
export { inferLanguageFromPath } from './language'
export { getFileName, normalizeFilePath } from './path'
export {
  cloneVfs,
  createFile,
  deleteFile,
  deserializeVfs,
  getFile,
  renameFile,
  serializeVfs,
  updateFileContent,
} from './vfs'
export type { FileLanguage, SerializedVfs, VfsFile, VfsMap } from './types'
