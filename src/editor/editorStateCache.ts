import { historyField } from '@codemirror/commands'
import type { ReactCodeMirrorProps, ViewUpdate } from '@uiw/react-codemirror'

type SerializedEditorState = {
  fields: NonNullable<ReactCodeMirrorProps['initialState']>['fields']
  json: unknown
}

const editorStateFields = {
  history: historyField,
} satisfies NonNullable<ReactCodeMirrorProps['initialState']>['fields']

const editorStateByFilePath = new Map<string, SerializedEditorState>()

function getEditorState(filePath: string): SerializedEditorState | undefined {
  return editorStateByFilePath.get(filePath)
}

function setEditorState(filePath: string, viewUpdate: ViewUpdate) {
  editorStateByFilePath.set(filePath, {
    fields: editorStateFields,
    json: viewUpdate.state.toJSON(editorStateFields),
  })
}

export { getEditorState, setEditorState }
export type { SerializedEditorState }
