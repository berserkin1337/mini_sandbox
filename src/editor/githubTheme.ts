import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { Compartment, type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { tags } from '@lezer/highlight'

type GithubThemeMode = 'dark' | 'light'

type GithubEditorColors = {
  accent: string
  bracketBackground: string
  bracketBorder: string
  canvasDefault: string
  canvasSubtle: string
  fgDefault: string
  fgMuted: string
  overlayShadow: string
  primerBorder: string
  selection: string
}

const githubEditorColorsByMode: Record<GithubThemeMode, GithubEditorColors> = {
  light: {
    accent: '#0969da',
    bracketBackground: '#aceebb66',
    bracketBorder: '#4ac26b99',
    canvasDefault: '#ffffff',
    canvasSubtle: '#f6f8fa',
    fgDefault: '#1f2328',
    fgMuted: '#6e7781',
    overlayShadow: '#140c1c1f',
    primerBorder: '#d0d7de',
    selection: '#0969da33',
  },
  dark: {
    accent: '#2f81f7',
    bracketBackground: '#3fb95040',
    bracketBorder: '#3fb95099',
    canvasDefault: '#0d1117',
    canvasSubtle: '#161b22',
    fgDefault: '#e6edf3',
    fgMuted: '#7d8590',
    overlayShadow: '#01040966',
    primerBorder: '#30363d',
    selection: '#2f81f733',
  },
}

const sharedEditorTheme = {
  '&': {
    height: '100%',
  },
  '.cm-content': {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    fontSize: '13px',
    lineHeight: '20px',
    padding: '16px 0',
  },
  '.cm-line': {
    padding: '0 20px',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    fontFamily: 'inherit',
  },
} satisfies Parameters<typeof EditorView.theme>[0]

function createTokenTheme(colors: GithubEditorColors) {
  return {
    '&': {
      backgroundColor: colors.canvasDefault,
      color: colors.fgDefault,
    },
    '.cm-activeLine': {
      backgroundColor: colors.canvasSubtle,
    },
    '.cm-activeLineGutter': {
      backgroundColor: colors.canvasSubtle,
      color: colors.fgDefault,
    },
    '.cm-content': {
      caretColor: colors.accent,
    },
    '.cm-cursor': {
      borderLeftColor: colors.accent,
    },
    '.cm-dropCursor': {
      borderLeftColor: colors.accent,
    },
    '.cm-gutters': {
      backgroundColor: colors.canvasDefault,
      borderRight: `1px solid ${colors.primerBorder}`,
      color: colors.fgMuted,
    },
    '.cm-matchingBracket, .cm-nonmatchingBracket': {
      backgroundColor: colors.bracketBackground,
      outline: `1px solid ${colors.bracketBorder}`,
    },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection':
      {
        backgroundColor: colors.selection,
      },
    '.cm-tooltip': {
      backgroundColor: colors.canvasDefault,
      border: `1px solid ${colors.primerBorder}`,
      borderRadius: '6px',
      boxShadow: `0 8px 24px ${colors.overlayShadow}`,
      color: colors.fgDefault,
    },
  } satisfies Parameters<typeof EditorView.theme>[0]
}

function createGithubEditorTheme(mode: GithubThemeMode) {
  const colors = githubEditorColorsByMode[mode]

  return EditorView.theme(
    {
      ...sharedEditorTheme,
      ...createTokenTheme(colors),
    },
    { dark: mode === 'dark' },
  )
}

const githubLightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#cf222e' },
  {
    tag: [tags.name, tags.deleted, tags.character, tags.propertyName],
    color: '#116329',
  },
  { tag: [tags.function(tags.variableName), tags.labelName], color: '#8250df' },
  {
    tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
    color: '#0550ae',
  },
  { tag: [tags.definition(tags.name), tags.separator], color: '#24292f' },
  {
    tag: [
      tags.className,
      tags.number,
      tags.changed,
      tags.annotation,
      tags.modifier,
    ],
    color: '#953800',
  },
  { tag: [tags.typeName, tags.tagName], color: '#116329' },
  { tag: [tags.operator, tags.operatorKeyword], color: '#cf222e' },
  { tag: [tags.url, tags.escape, tags.regexp, tags.link], color: '#0a3069' },
  { tag: [tags.meta, tags.comment], color: '#6e7781' },
  { tag: tags.strong, fontWeight: '600' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.link, textDecoration: 'underline' },
  { tag: tags.heading, fontWeight: '600', color: '#0550ae' },
  {
    tag: [tags.atom, tags.bool, tags.special(tags.variableName)],
    color: '#0550ae',
  },
  {
    tag: [tags.processingInstruction, tags.string, tags.inserted],
    color: '#0a3069',
  },
  { tag: tags.invalid, color: '#82071e' },
])

const githubDarkHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#ff7b72' },
  {
    tag: [tags.name, tags.deleted, tags.character, tags.propertyName],
    color: '#7ee787',
  },
  { tag: [tags.function(tags.variableName), tags.labelName], color: '#d2a8ff' },
  {
    tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
    color: '#79c0ff',
  },
  { tag: [tags.definition(tags.name), tags.separator], color: '#e6edf3' },
  {
    tag: [
      tags.className,
      tags.number,
      tags.changed,
      tags.annotation,
      tags.modifier,
    ],
    color: '#ffa657',
  },
  { tag: [tags.typeName, tags.tagName], color: '#7ee787' },
  { tag: [tags.operator, tags.operatorKeyword], color: '#ff7b72' },
  { tag: [tags.url, tags.escape, tags.regexp, tags.link], color: '#a5d6ff' },
  { tag: [tags.meta, tags.comment], color: '#8b949e' },
  { tag: tags.strong, fontWeight: '600' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.link, textDecoration: 'underline' },
  { tag: tags.heading, fontWeight: '600', color: '#79c0ff' },
  {
    tag: [tags.atom, tags.bool, tags.special(tags.variableName)],
    color: '#79c0ff',
  },
  {
    tag: [tags.processingInstruction, tags.string, tags.inserted],
    color: '#a5d6ff',
  },
  { tag: tags.invalid, color: '#ffa198' },
])

export const githubEditorThemes = {
  dark: createGithubEditorTheme('dark'),
  light: createGithubEditorTheme('light'),
} satisfies Record<GithubThemeMode, ReturnType<typeof createGithubEditorTheme>>

export const githubSyntaxHighlighting = {
  dark: syntaxHighlighting(githubDarkHighlightStyle),
  light: syntaxHighlighting(githubLightHighlightStyle),
} satisfies Record<GithubThemeMode, ReturnType<typeof syntaxHighlighting>>

const githubEditorThemeCompartment = new Compartment()
const githubSyntaxHighlightingCompartment = new Compartment()

function getGithubThemeExtensions(mode: GithubThemeMode): Extension[] {
  return [
    githubEditorThemeCompartment.of(githubEditorThemes[mode]),
    githubSyntaxHighlightingCompartment.of(githubSyntaxHighlighting[mode]),
  ]
}

function reconfigureGithubTheme(view: EditorView, mode: GithubThemeMode) {
  const editorTheme = githubEditorThemes[mode]
  const syntaxHighlighting = githubSyntaxHighlighting[mode]
  const effects = []

  if (githubEditorThemeCompartment.get(view.state) !== editorTheme) {
    effects.push(githubEditorThemeCompartment.reconfigure(editorTheme))
  }

  if (
    githubSyntaxHighlightingCompartment.get(view.state) !== syntaxHighlighting
  ) {
    effects.push(
      githubSyntaxHighlightingCompartment.reconfigure(syntaxHighlighting),
    )
  }

  if (effects.length > 0) {
    view.dispatch({ effects })
  }
}

export { getGithubThemeExtensions, reconfigureGithubTheme }
export type { GithubThemeMode }
