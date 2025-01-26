import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes } from "lexical";

import { $createImageNode } from "../nodes/ImageNode";
import { useImageStore } from "../../../stores/tempImage.store";
import { INSERT_IMAGE_COMMAND } from "../command";
import { useGlobalStore } from "@/stores/global.store";
import imageCompression from "browser-image-compression";
import { getObjectName } from "@/apis/minio";

type InsertImagePayload = File;

const fileToUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

export default function ImagePlugin(): null {
  const [editor] = useLexicalComposerContext();
  const { addPendingImage } = useImageStore();
  const { userInfo } = useGlobalStore();

  useEffect(() => {
    return editor.registerCommand<InsertImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        // 비동기 작업을 즉시 시작하되, Command Handler는 동기적으로 true 반환
        const file = payload;

        // 비동기 작업을 별도로 실행
        (async () => {
          try {
            const compressedFile = await imageCompression(file, {
              maxSizeMB: 1,
              initialQuality: 0.8,
              useWebWorker: true,
            });

            const newName = getObjectName(userInfo!.pid as string, file.name);

            const renamedFile = new File(
              [compressedFile],
              encodeURIComponent(newName),
              {
                type: compressedFile.type,
              }
            );

            const preview = fileToUrl(renamedFile);
            // 비동기 작업이 완료된 후 에디터 업데이트
            editor.update(() => {
              const imageNode = $createImageNode(preview, file.name);
              $insertNodes([imageNode]);
            });

            // 이미지 정보를 저장소에 추가
            addPendingImage({
              file: renamedFile,
              preview,
              objectName: newName,
            });
          } catch (error) {
            console.error("Failed to process image:", error);
            // 에러 처리를 위한 UI 피드백을 여기서 추가할 수 있습니다
          }
        })();

        // Command Handler는 즉시 true 반환
        return true;
      },
      1
    );
  }, [editor]);

  return null;
}
