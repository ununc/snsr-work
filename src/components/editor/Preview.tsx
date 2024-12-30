import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ImageNode } from "./nodes/ImageNode";
import { LinkNode } from "@lexical/link";
import { HeadingNode } from "@lexical/rich-text";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { TablePastePlugin } from "./plugins/TablePastePlugin";
import ImagePlugin from "./plugins/ImagePlugin";
import { theme } from "./theme";

interface EditorState {
  root: {
    children: Array<{
      children: Array<{
        detail?: number;
        format?: number;
        mode?: string;
        style?: string;
        text?: string;
        type: string;
        version: number;
        src?: string;
        altText?: string;
      }>;
      direction: string;
      format: string;
      indent: number;
      type: string;
      version: number;
    }>;
  };
}

interface PreviewEditorProps {
  editorState: string | EditorState;
}

const Placeholder = () => <div className="text-gray-400">Start typing...</div>;

export const PreviewEditor: React.FC<PreviewEditorProps> = ({
  editorState,
}) => {
  const initialConfig: InitialConfigType = {
    namespace: "Preview",
    editorState:
      typeof editorState === "string"
        ? editorState
        : JSON.stringify(editorState),
    theme,
    nodes: [
      HeadingNode,
      ImageNode,
      LinkNode,
      TableNode,
      TableCellNode,
      TableRowNode,
    ],
    editable: false,
    onError: (error: Error) => console.error(error),
  };

  return (
    <div className="rounded p-4 bg-gray-50/80 h-full">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="outline-none min-h-[100px]" />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={({ children }) => <div>{children}</div>}
          />
        </div>
        <HistoryPlugin />
        <TablePlugin />
        <TablePastePlugin />
        <LinkPlugin />
        <ImagePlugin />
      </LexicalComposer>
    </div>
  );
};
