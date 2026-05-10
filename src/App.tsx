import { useMemo } from 'react'

import { Tree, type TreeViewElement } from '@/components/ui/file-tree'
import { CodeEditor } from '@/editor'
import type { VfsMap } from '@/fs'
import { useVfsStore } from '@/store'

type FileTreeModel = {
  elements: TreeViewElement[]
  expandedFolderIds: string[]
}

type MutableTreeFolder = TreeViewElement & {
  children: TreeViewElement[]
}

function createFolder(id: string, name: string): MutableTreeFolder {
  return {
    children: [],
    id,
    isSelectable: true,
    name,
    type: 'folder',
  }
}

function buildFileTree(files: VfsMap): FileTreeModel {
  const root = createFolder('', '')
  const folders = new Map<string, MutableTreeFolder>([['', root]])

  for (const path of files.keys()) {
    const segments = path.split('/').filter(Boolean)
    let currentFolder = root
    let currentPath = ''

    segments.forEach((segment, index) => {
      currentPath = `${currentPath}/${segment}`
      const isFile = index === segments.length - 1

      if (isFile) {
        currentFolder.children.push({
          id: currentPath,
          isSelectable: true,
          name: segment,
          type: 'file',
        })
        return
      }

      const existingFolder = folders.get(currentPath)

      if (existingFolder) {
        currentFolder = existingFolder
        return
      }

      const nextFolder = createFolder(currentPath, segment)
      folders.set(currentPath, nextFolder)
      currentFolder.children.push(nextFolder)
      currentFolder = nextFolder
    })
  }

  return {
    elements: root.children,
    expandedFolderIds: Array.from(folders.keys()).filter(Boolean),
  }
}

function App() {
  const activeFilePath = useVfsStore((state) => state.activeFilePath)
  const files = useVfsStore((state) => state.files)
  const setActiveFile = useVfsStore((state) => state.setActiveFile)
  const updateFileContent = useVfsStore((state) => state.updateFileContent)

  const fileTree = useMemo(() => buildFileTree(files), [files])
  const activeFile = files.get(activeFilePath)

  return (
    <main className="flex h-screen min-h-0 bg-(--github-canvas-default) text-[var(--github-fg-default)]">
      <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--github-border-default)] bg-[var(--github-canvas-inset)]">
        <header className="border-b border-[var(--github-border-default)] px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Files
          </p>
        </header>

        <nav
          className="min-h-0 flex-1 overflow-auto p-2"
          aria-label="Project files"
        >
          <Tree
            className="text-[13px]"
            elements={fileTree.elements}
            initialExpandedItems={fileTree.expandedFolderIds}
            initialSelectedId={activeFilePath}
            onItemSelect={(id) => {
              if (files.has(id)) {
                setActiveFile(id)
              }
            }}
          />
        </nav>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-(--github-border-default) bg-(--github-canvas-default) px-4">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-medium">{activeFilePath}</h1>
            <p className="text-xs text-muted-foreground">
              CodeMirror 6 connected to the virtual file system
            </p>
          </div>
        </header>

        <div className="min-h-0 flex-1 bg-[var(--github-canvas-default)]">
          {activeFile === undefined ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select a file to start editing.
            </div>
          ) : (
            <CodeEditor
              content={activeFile.content}
              filePath={activeFilePath}
              language={activeFile.language}
              onChange={(content) => updateFileContent(activeFilePath, content)}
            />
          )}
        </div>
      </section>
    </main>
  )
}

export default App
