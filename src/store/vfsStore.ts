import { create } from 'zustand'
import {
  createDefaultVfs,
  createFile,
  deleteFile,
  getFile,
  normalizeFilePath,
  renameFile,
  updateFileContent,
  type VfsFile,
  type VfsMap,
} from '@/fs'

type VfsState = {
  activeFilePath: string
  files: VfsMap
  createFile: (path: string, content?: string) => void
  deleteFile: (path: string) => void
  getActiveFile: () => VfsFile | undefined
  renameFile: (fromPath: string, toPath: string) => void
  setActiveFile: (path: string) => void
  updateFileContent: (path: string, content: string) => void
}

const initialFiles = createDefaultVfs()
const initialActiveFilePath = '/src/App.tsx'

export const useVfsStore = create<VfsState>((set, get) => ({
  activeFilePath: initialActiveFilePath,
  files: initialFiles,

  createFile: (path, content = '') => {
    const normalizedPath = normalizeFilePath(path)

    set((state) => ({
      activeFilePath: normalizedPath,
      files: createFile(state.files, normalizedPath, content),
    }))
  },

  deleteFile: (path) => {
    const normalizedPath = normalizeFilePath(path)

    set((state) => {
      const nextFiles = deleteFile(state.files, normalizedPath)
      const activeFilePath =
        state.activeFilePath === normalizedPath
          ? (nextFiles.keys().next().value ?? '')
          : state.activeFilePath

      return {
        activeFilePath,
        files: nextFiles,
      }
    })
  },

  getActiveFile: () => getFile(get().files, get().activeFilePath),

  renameFile: (fromPath, toPath) => {
    const normalizedFromPath = normalizeFilePath(fromPath)
    const normalizedToPath = normalizeFilePath(toPath)

    set((state) => ({
      activeFilePath:
        state.activeFilePath === normalizedFromPath
          ? normalizedToPath
          : state.activeFilePath,
      files: renameFile(state.files, normalizedFromPath, normalizedToPath),
    }))
  },

  setActiveFile: (path) => {
    const normalizedPath = normalizeFilePath(path)

    set((state) => {
      if (!state.files.has(normalizedPath)) {
        throw new Error(`File does not exist: ${normalizedPath}`)
      }

      return { activeFilePath: normalizedPath }
    })
  },

  updateFileContent: (path, content) => {
    const normalizedPath = normalizeFilePath(path)

    set((state) => ({
      files: updateFileContent(state.files, normalizedPath, content),
    }))
  },
}))
