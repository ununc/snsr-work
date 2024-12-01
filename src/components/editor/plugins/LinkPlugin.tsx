import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LinkPlugin as LexicalLinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import {
  TOGGLE_LINK_COMMAND,
  $createLinkNode,
  $isLinkNode,
} from "@lexical/link";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";

export function LinkPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      TOGGLE_LINK_COMMAND,
      (payload: string | null) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const nodes = selection.extract();
        if (payload === null) {
          // 링크 제거
          nodes.forEach((node) => {
            if ($isLinkNode(node)) {
              const textContent = node.getTextContent();
              node.selectNext();
              node.remove();
              selection.insertText(textContent);
            }
          });
        } else {
          // 새 링크 생성
          const linkNode = $createLinkNode(payload);
          selection.insertNodes([linkNode]);
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return <LexicalLinkPlugin />;
}
