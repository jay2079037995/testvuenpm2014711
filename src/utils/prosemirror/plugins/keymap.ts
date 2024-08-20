import { splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list'
import type { Schema } from 'prosemirror-model'
import { undo, redo } from 'prosemirror-history'
import { undoInputRule } from 'prosemirror-inputrules'
import { type Command, TextSelection } from 'prosemirror-state'
import {
  toggleMark,
  selectParentNode,
  joinUp,
  joinDown,
  chainCommands,
  newlineInCode,
  createParagraphNear,
  liftEmptyBlock,
  splitBlockKeepMarks,
  selectAll
} from 'prosemirror-commands'

interface Keys {
  [key: string]: Command
}

export const buildKeymap = (schema: Schema) => {
  const keys: Keys = {}
  const bind = (key: string, cmd: Command) => keys[key] = cmd

  bind('Alt-ArrowUp', joinUp)
  bind('Alt-ArrowDown', joinDown)
  bind('Mod-z', undo)
  bind('Mod-y', redo)
  bind('Backspace', undoInputRule)
  bind('Escape', selectParentNode)
  bind('Mod-a', (state, dispatch) => {
    const from = 1
    const to = state.doc.content.size - 1

    // 创建一个新的TextSelection对象，全选文本但不选中最外层格式
    const selection = TextSelection.create(state.doc, from, to)

    // 创建一个新的Transaction，将选中文本应用于新的状态
    const tr = state.tr.setSelection(selection)

    // 将Transaction应用于EditorState
    if (dispatch) {
      dispatch(tr)
    }
    return true
  })
  bind('Mod-b', toggleMark(schema.marks.strong))
  bind('Mod-i', toggleMark(schema.marks.em))
  bind('Mod-u', toggleMark(schema.marks.underline))
  bind('Mod-d', toggleMark(schema.marks.strikethrough))
  bind('Mod-e', toggleMark(schema.marks.code))
  bind('Mod-;', toggleMark(schema.marks.superscript))
  bind(`Mod-'`, toggleMark(schema.marks.subscript))
  bind('Enter', chainCommands(
    splitListItem(schema.nodes.list_item),
    newlineInCode,
    createParagraphNear,
    liftEmptyBlock,
    splitBlockKeepMarks,
  ))
  bind('Mod-[', liftListItem(schema.nodes.list_item))
  bind('Mod-]', sinkListItem(schema.nodes.list_item))
  bind('Tab', sinkListItem(schema.nodes.list_item))

  return keys
}