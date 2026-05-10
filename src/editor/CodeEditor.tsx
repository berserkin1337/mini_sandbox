import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import type { EditorView } from '@codemirror/view'
import CodeMirror, { type Extension } from '@uiw/react-codemirror'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import type { FileLanguage } from '@/fs'
import { useSystemTheme } from '@/theme/useSystemTheme'

import { getEditorState, setEditorState } from './editorStateCache'
import { getGithubThemeExtensions, reconfigureGithubTheme } from './githubTheme'

type CodeEditorProps = {
  content: string
  filePath: string
  language: FileLanguage
  onChange: (content: string) => void
}

type LanguageExtensionContext = {
  filePath: string
}

type LanguageExtensionBuilder = (
  context: LanguageExtensionContext,
) => Extension[]

const languageExtensionBuilders = {
  css: () => [css()],
  html: () => [html()],
  javascript: ({ filePath }) => [
    javascript({ jsx: filePath.endsWith('.jsx') }),
  ],
  typescript: ({ filePath }) => [
    javascript({ jsx: filePath.endsWith('.tsx'), typescript: true }),
  ],
} satisfies Partial<Record<FileLanguage, LanguageExtensionBuilder>>

function getLanguageExtensions(
  language: FileLanguage,
  filePath: string,
): Extension[] {
  switch (language) {
    case 'css':
    case 'html':
    case 'javascript':
    case 'typescript':
      return languageExtensionBuilders[language]({ filePath })
    default:
      return []
  }
}

export function CodeEditor({
  content,
  filePath,
  language,
  onChange,
}: CodeEditorProps) {
  const themeMode = useSystemTheme()
  const editorViewRef = useRef<EditorView | null>(null)
  const initialState = getEditorState(filePath)
  const extensions = useMemo(
    () => [
      ...getGithubThemeExtensions(themeMode),
      ...getLanguageExtensions(language, filePath),
    ],
    [filePath, language, themeMode],
  )
  const reconfigureCurrentTheme = useCallback(
    (view: EditorView) => reconfigureGithubTheme(view, themeMode),
    [themeMode],
  )

  useEffect(() => {
    if (editorViewRef.current) {
      reconfigureCurrentTheme(editorViewRef.current)
    }
  }, [reconfigureCurrentTheme])

  return (
    <CodeMirror
      key={filePath}
      value={content}
      height="100%"
      theme="none"
      extensions={extensions}
      initialState={initialState}
      basicSetup={{
        autocompletion: true,
        bracketMatching: true,
        closeBrackets: true,
        completionKeymap: true,
        defaultKeymap: true,
        foldGutter: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        highlightSelectionMatches: true,
        history: true,
        lineNumbers: true,
        searchKeymap: true,
      }}
      className="h-full overflow-hidden text-[13px]"
      onCreateEditor={(view) => {
        editorViewRef.current = view
        reconfigureCurrentTheme(view)
      }}
      onChange={onChange}
      onUpdate={(viewUpdate) => {
        if (!viewUpdate.docChanged && !viewUpdate.selectionSet) return
        setEditorState(filePath, viewUpdate)
      }}
    />
  )
}
