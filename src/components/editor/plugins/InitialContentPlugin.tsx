import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { useEffect } from "react";

export function InitialContentPlugin({ init }: { init: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!init) return;

    try {
      // Parse the initial state from JSON
      const initialState = JSON.parse(init);

      editor.update(() => {
        // Clear the current editor state
        $getRoot().clear();

        // Reconstruct the editor state from the parsed JSON
        const editorState = editor.parseEditorState(initialState);
        editor.setEditorState(editorState);
      });
    } catch (error) {
      console.error("Error initializing content:", error);
    }
  }, [editor, init]);

  return null;
}
