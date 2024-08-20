import { keymap } from 'prosemirror-keymap'
import type { Schema } from 'prosemirror-model'
import { history } from 'prosemirror-history'
import { baseKeymap } from 'prosemirror-commands'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'

import { buildKeymap } from './keymap'
import { buildInputRules } from './inputrules'
import { placeholderPlugin } from './placeholder'

export interface PluginOptions {
  placeholder?: string
  ySyncPlugin?: any
  yCursorPlugin?: any
  yUndoPlugin?: any
}

export const buildPlugins = (schema: Schema, options?: PluginOptions) => {
  const placeholder = options?.placeholder
  const ySyncPlugin = options?.ySyncPlugin
  const yCursorPlugin = options?.yCursorPlugin
  const yUndoPlugin = options?.yUndoPlugin

  const plugins = [
    buildInputRules(schema),
    keymap(buildKeymap(schema)),
    keymap(baseKeymap),
    dropCursor(),
    gapCursor(),
    history(),
  ]

  if (placeholder) plugins.push(placeholderPlugin(placeholder))
  if (ySyncPlugin) plugins.push(ySyncPlugin)
  if (yCursorPlugin) plugins.push(yCursorPlugin)
  if (yUndoPlugin) plugins.push(yUndoPlugin)

  return plugins
}