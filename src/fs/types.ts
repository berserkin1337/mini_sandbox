export type FileLanguage =
  | 'css'
  | 'html'
  | 'javascript'
  | 'json'
  | 'markdown'
  | 'plaintext'
  | 'typescript'

export type VfsFile = {
  content: string
  language: FileLanguage
}

export type VfsMap = Map<string, VfsFile>

export type SerializedVfs = Record<string, VfsFile>
