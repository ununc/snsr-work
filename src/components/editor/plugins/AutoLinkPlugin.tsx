import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $createTextNode,
  $isTextNode,
  $getSelection,
  COMMAND_PRIORITY_LOW,
  KEY_SPACE_COMMAND,
  KEY_ENTER_COMMAND,
  createCommand,
  RangeSelection,
} from "lexical";
import { $createLinkNode, $isLinkNode } from "@lexical/link";
import { mergeRegister } from "@lexical/utils";

// URL 매칭 패턴 - 전역 플래그(g)를 추가하여 모든 URL을 찾을 수 있게 합니다
const URL_MATCHER =
  /(https?:\/\/[^\s]+|www\.[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z0-9-.]+[^\s]*)/g;

const TRANSFORM_URL_COMMAND = createCommand<void>();

export function AutoLinkPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let isTransforming = false;

    // URL 변환 및 커서 위치 조정 함수
    const transformTextToLink = (insertSpace: boolean = false): boolean => {
      if (isTransforming) return false;

      const selection = $getSelection();
      if (!selection?.isCollapsed()) {
        return false;
      }

      const anchorNode = (selection as RangeSelection).anchor.getNode();
      if (!$isTextNode(anchorNode)) {
        return false;
      }

      const parentNode = anchorNode.getParent();
      if (parentNode && $isLinkNode(parentNode)) return false;

      const text = anchorNode.getTextContent();
      const matches = Array.from(text.matchAll(URL_MATCHER));

      if (matches.length === 0) return false;

      isTransforming = true;

      try {
        const nodes = [];
        let lastIndex = 0;

        for (const match of matches) {
          const url = match[0];
          const startIndex = match.index;

          if (startIndex > lastIndex) {
            const beforeText = text.slice(lastIndex, startIndex);
            nodes.push($createTextNode(beforeText));
          }

          const linkNode = $createLinkNode(
            url.startsWith("http") ? url : `https://${url}`
          );
          linkNode.append($createTextNode(url));
          nodes.push(linkNode);

          lastIndex = startIndex + url.length;
        }

        // 남은 텍스트가 있다면 추가
        if (lastIndex < text.length) {
          nodes.push($createTextNode(text.slice(lastIndex)));
        }

        // 스페이스를 추가할 경우
        if (insertSpace) {
          nodes.push($createTextNode(""));
        }

        // 노드 교체 및 삽입
        if (nodes.length > 0) {
          anchorNode.replace(nodes[0]);
          let previousNode = nodes[0];

          for (let i = 1; i < nodes.length; i++) {
            previousNode.insertAfter(nodes[i]);
            previousNode = nodes[i];
          }

          // 커서를 마지막 노드의 끝으로 이동
          const lastNode = nodes[nodes.length - 1];
          lastNode.select(
            lastNode.getTextContent().length,
            lastNode.getTextContent().length
          );
        }

        return true;
      } catch (error) {
        console.error("Error during URL transformation:", error);
        return false;
      } finally {
        isTransforming = false;
      }
    };

    // 스페이스 키 처리 함수
    const handleSpaceCommand = (): boolean => {
      let transformed = false;
      editor.update(() => {
        transformed = transformTextToLink(true); // true를 전달하여 스페이스 추가
      });
      return transformed; // 변환이 발생했다면 기본 스페이스 입력을 막습니다
    };

    // 엔터 키 처리 함수
    const handleEnterCommand = (): boolean => {
      let transformed = false;
      editor.update(() => {
        transformed = transformTextToLink(false);
      });
      return transformed;
    };

    return mergeRegister(
      editor.registerCommand(
        KEY_SPACE_COMMAND,
        handleSpaceCommand,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        handleEnterCommand,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        TRANSFORM_URL_COMMAND,
        () => {
          let transformed = false;
          editor.update(() => {
            transformed = transformTextToLink(false);
          });
          return transformed;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return null;
}
