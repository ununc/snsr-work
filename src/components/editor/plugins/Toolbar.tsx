import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  $createParagraphNode,
  COMMAND_PRIORITY_CRITICAL,
  createCommand,
  LexicalCommand,
  $isTextNode,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, HeadingTagType } from "@lexical/rich-text";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { INSERT_IMAGE_COMMAND } from "../command";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Image,
  Italic,
  Link,
  Palette,
  Table,
  Type,
  Underline,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const SET_TEXT_STYLE_COMMAND: LexicalCommand<{
  key: string;
  value: string;
}> = createCommand();

export default function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [linkUrl, setLinkUrl] = useState("https://");
  const [tableRows, setTableRows] = useState("2");
  const [tableCols, setTableCols] = useState("2");

  const insertLink = () => {
    if (linkUrl && linkUrl !== "https://") {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      insertLink();
    }
  };

  useEffect(() => {
    return editor.registerCommand(
      SET_TEXT_STYLE_COMMAND,
      ({ key, value }) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          nodes.forEach((node) => {
            if ($isTextNode(node)) {
              node.setStyle(`${key}: ${value}`);
            }
          });
        }
        return true;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  const handleFontSize = (tag: HeadingTagType | "normal") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (tag === "normal") {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createHeadingNode(tag));
        }
      }
    });
  };

  const handleTextColor = (color: string) => {
    editor.dispatchCommand(SET_TEXT_STYLE_COMMAND, {
      key: "color",
      value: color,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, file);
    }
  };

  const insertTableWithDimensions = () => {
    editor?.dispatchCommand(INSERT_TABLE_COMMAND, {
      rows: tableRows,
      columns: tableCols,
    });
  };

  return (
    <div className="toolbar p-2 flex items-center gap-1 border-b flex-shrink-0">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        className="h-8 w-8 p-0"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        className="h-8 w-8 p-0"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        className="h-8 w-8 p-0"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <div className="h-4 w-px bg-gray-200" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Type className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleFontSize("normal")}>
            기본 크기
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFontSize("h1")}>
            큰 제목
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFontSize("h2")}>
            중간 제목
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFontSize("h3")}>
            작은 제목
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-32 p-2">
          <input
            type="color"
            onChange={(e) => handleTextColor(e.target.value)}
            className="w-full h-8"
            title="텍스트 색상"
          />
        </PopoverContent>
      </Popover>

      <div className="h-4 w-px bg-gray-200" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Link className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="URL을 입력하세요"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              className="flex-1"
            />
            <Button onClick={insertLink} size="sm">
              적용
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => document.getElementById("image-upload")?.click()}
      >
        <Image className="h-4 w-4" />
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Table className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-1">행</label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-1">열</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <Button onClick={insertTableWithDimensions} className="w-full">
              표 삽입
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
