import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes } from "lexical";

import { $createImageNode } from "../nodes/ImageNode";
import { useImageStore } from "../../../stores/tempImage.store";
import { useUserStore } from "@/stores/userInfo.store";
import { INSERT_IMAGE_COMMAND } from "../command";
import { getPresignedUrl } from "@/apis/minio/images";

type InsertImagePayload = File;
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function ImagePlugin(): null {
  const [editor] = useLexicalComposerContext();
  const { addPendingImage } = useImageStore();
  const { user } = useUserStore();

  useEffect(() => {
    return editor.registerCommand<InsertImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        // 비동기 작업을 즉시 시작하되, Command Handler는 동기적으로 true 반환
        const file = payload;

        // 비동기 작업을 별도로 실행
        (async () => {
          try {
            // Backend에서 presigned URL 요청
            const { url, objectName } = await getPresignedUrl(
              user?.pid ?? "",
              file.name
            );

            // 파일을 base64로 변환
            const base64 = await fileToBase64(file);

            // 비동기 작업이 완료된 후 에디터 업데이트
            editor.update(() => {
              const imageNode = $createImageNode(base64, file.name);
              $insertNodes([imageNode]);
            });

            // 이미지 정보를 저장소에 추가
            addPendingImage({
              objectName,
              url,
              file,
              base64,
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
