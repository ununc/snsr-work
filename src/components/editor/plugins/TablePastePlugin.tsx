import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTableNodeWithDimensions,
  $createTableCellNode,
  $createTableRowNode,
} from "@lexical/table";
import {
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
} from "lexical";
import { useEffect } from "react";

export function TablePastePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;
        event.preventDefault();

        const htmlContent = clipboardData.getData("text/html");
        const textContent = clipboardData.getData("text/plain");

        // HTML 테이블 처리 (엑셀/구글 시트에서 복사한 경우)
        // HTML 테이블 처리
        if (htmlContent?.includes("table")) {
          editor.update(() => {
            const selection = $getSelection();

            if (!selection || typeof selection.insertNodes !== "function") {
              return;
            }

            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = htmlContent;
            const tables = tempDiv.getElementsByTagName("table");
            if (tables.length > 0) {
              const validRows = Array.from(tables[0].rows);
              // 유효한 행이 있는 경우에만 테이블 생성
              if (validRows.length > 0) {
                const tableNode = $createTableNodeWithDimensions(0, 0);
                validRows.forEach((row) => {
                  const tableRow = $createTableRowNode();

                  Array.from(row.cells).forEach((cell) => {
                    const content = cell.textContent ?? "";
                    if (content.trim().length > 0) {
                      const tableCell = $createTableCellNode(1);
                      const paragraph = $createParagraphNode();
                      paragraph.append($createTextNode(content.trim()));
                      tableCell.append(paragraph);
                      tableRow.append(tableCell);
                    }
                  });
                  if (tableRow.getChildrenSize() > 0) {
                    tableNode.append(tableRow); // 빈 row를 추가하지 않도록 확인
                  }
                });
                selection.insertNodes([tableNode]);
              }
            }
          });

          return true;
        }

        // 텍스트로 된 테이블 처리
        if (textContent?.includes("\t")) {
          editor.update(() => {
            const selection = $getSelection();

            if (!selection || typeof selection.insertNodes !== "function") {
              return;
            }

            const rows = textContent
              .split("\n")
              .map((row) => row.split("\t").map((cell) => cell.trim()))
              .filter((row) => row.some((cell) => cell.length > 0)); // 빈 줄 필터링

            if (rows.length > 0) {
              const tableNode = $createTableNodeWithDimensions(0, 0);

              rows.forEach((row) => {
                const tableRow = $createTableRowNode();
                row.forEach((cellText) => {
                  if (cellText.length > 0) {
                    const tableCell = $createTableCellNode(1);
                    const paragraph = $createParagraphNode();
                    paragraph.append($createTextNode(cellText));
                    tableCell.append(paragraph);
                    tableRow.append(tableCell);
                  }
                });

                if (tableRow.getChildrenSize() > 0) {
                  tableNode.append(tableRow); // 빈 row를 추가하지 않도록 확인
                }
              });

              selection.insertNodes([tableNode]);
            }
          });

          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}
