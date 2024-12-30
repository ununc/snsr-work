import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { LinkNode } from "@lexical/link";
import { HeadingNode } from "@lexical/rich-text";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";

import Toolbar from "./plugins/Toolbar";
import ImagePlugin from "./plugins/ImagePlugin";
import AutoFocusPlugin from "./plugins/AutoFocusPlugin";
import { ImageNode } from "./nodes/ImageNode";
import { InitialContentPlugin } from "./plugins/InitialContentPlugin";
import { OnChangePlugin } from "./plugins/OnChangePlugin";
import { AutoLinkPlugin } from "./plugins/AutoLinkPlugin";
import { TablePastePlugin } from "./plugins/TablePastePlugin";
import { useChangedStringStore } from "@/stores/editor.store";
import { theme } from "./theme";

function onError(error: Error) {
  console.error(error);
}

const initialConfig = {
  namespace: "MyEditor",
  theme,
  onError,
  nodes: [
    HeadingNode,
    ImageNode,
    LinkNode,
    TableNode,
    TableCellNode,
    TableRowNode,
  ],
};

export const Editor = ({ text = "" }: { text?: string }) => {
  const { setText } = useChangedStringStore();
  const handleChange = (content: string) => {
    setText(content);
  };

  return (
    <div className="relative leading-normal mx-0 border rounded-lg h-full">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative flex flex-col h-full">
          <Toolbar />
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="absolute inset-0 overflow-y-auto resize-none text-base caret-[rgb(5,5,5)] p-4" />
              }
              placeholder={
                <div className="text-[#999] absolute pointer-events-none left-4 top-4">
                  내용을 입력하세요...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <InitialContentPlugin init={text} />
            <OnChangePlugin onChange={handleChange} />
            <HistoryPlugin />
            <TablePlugin />
            <TablePastePlugin />
            <LinkPlugin />
            <ImagePlugin />
            <AutoFocusPlugin />
          </div>
          <AutoLinkPlugin />
        </div>
      </LexicalComposer>
    </div>
  );
};
