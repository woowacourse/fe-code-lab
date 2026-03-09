'use client';

import { useRef, useEffect, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/language';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
}

const customTheme = EditorView.theme(
  {
    '&': {
      width: '100%',
      height: '100%',
      fontSize: '15px',
      backgroundColor: '#0d1117',
    },
    '.cm-scroller': {
      fontFamily: "'JetBrains Mono', monospace",
      lineHeight: '1.7',
    },
    '.cm-gutters': {
      backgroundColor: '#161b22',
      borderRight: '1px solid #30363d',
      color: '#6e7681',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#1c2333',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(88, 166, 255, 0.06)',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'rgba(88, 166, 255, 0.15) !important',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#58a6ff',
    },
    '.cm-content': {
      caretColor: '#58a6ff',
    },
  },
  { dark: true },
);

export default function CodeEditor({
  value,
  onChange,
  readonly = false,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  // Keep onChange ref up to date without triggering effect re-runs
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const getExtensions = useCallback(() => {
    const extensions = [
      lineNumbers(),
      history(),
      bracketMatching(),
      javascript(),
      oneDark,
      customTheme,
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current?.(update.state.doc.toString());
        }
      }),
    ];

    if (readonly) {
      extensions.push(
        EditorState.readOnly.of(true),
        EditorView.editable.of(false),
      );
    }

    return extensions;
  }, [readonly]);

  // Create editor
  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: getExtensions(),
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readonly]);

  // Sync external value changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
