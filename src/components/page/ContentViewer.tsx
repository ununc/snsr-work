import { useState } from "react";
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  FileIcon,
  VideoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";
import { ContentType } from "@/api-models/sub";

interface Content {
  type: ContentType;
  preview: string;
  objectPath: string;
  file?: File;
}

interface ContentViewerProps {
  contents: Content[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export const ContentViewer = ({
  contents,
  isOpen,
  onClose,
  initialIndex = 0,
}: ContentViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? contents.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === contents.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = async () => {
    try {
      const currentContent = contents[currentIndex];
      const response = await fetch(currentContent.preview);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = currentContent.objectPath.split("/").pop() || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const renderContent = () => {
    const currentContent = contents[currentIndex];

    switch (currentContent.type) {
      case ContentType.IMAGE:
        return (
          <img
            src={currentContent.preview}
            alt={`Content ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain"
            style={{ touchAction: "pinch-zoom" }}
          />
        );
      case ContentType.VIDEO:
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-white">
            <VideoIcon className="w-16 h-16" />
            <p className="text-lg">
              {currentContent.file?.name ||
                currentContent.objectPath.split("/").pop()}
            </p>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="bg-white/10 hover:bg-white/20"
            >
              Download Video
            </Button>
          </div>
        );
      case ContentType.DOCUMENT:
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-white">
            <FileIcon className="w-16 h-16" />
            <p className="text-lg">
              {currentContent.file?.name ||
                currentContent.objectPath.split("/").pop()}
            </p>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="bg-white/10 hover:bg-white/20"
            >
              Download Document
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const content = (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="absolute top-6 right-4 flex gap-2">
        {contents[currentIndex].type === ContentType.IMAGE && (
          <Button
            onClick={handleDownload}
            variant="outline"
            size="icon"
            className="bg-white/80"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="outline"
          size="icon"
          className="bg-white/80"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {contents.length > 1 && (
        <>
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleNext}
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      <div className="w-full h-full flex items-center justify-center">
        {renderContent()}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
        {currentIndex + 1} / {contents.length}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
