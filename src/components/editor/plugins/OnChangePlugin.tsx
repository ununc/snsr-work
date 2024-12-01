import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

export function OnChangePlugin({
  onChange,
}: {
  onChange: (string: string) => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // Serialize the editor state to JSON
        const serializedState = JSON.stringify(editorState);
        onChange(serializedState);
      });
    });
  }, [editor, onChange]);

  return null;
}
