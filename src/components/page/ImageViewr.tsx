import { useState } from "react";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  images: { preview: string; objectName: string }[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export const ImageViewer = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
}: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex].preview);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = images[currentIndex].objectName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 -top-6 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="absolute top-6 right-4 flex gap-2">
        <Button
          onClick={handleDownload}
          variant="outline"
          size="icon"
          className="bg-white/80"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          onClick={onClose}
          variant="outline"
          size="icon"
          className="bg-white/80"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Button
        onClick={handlePrevious}
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div
        className="w-full h-full flex items-center justify-center"
        style={{ touchAction: "pinch-zoom" }}
      >
        <img
          src={images[currentIndex].preview}
          alt={`Slide ${currentIndex + 1}`}
          className="max-h-full max-w-full object-contain"
          style={{ touchAction: "pinch-zoom" }}
        />
      </div>

      <Button
        onClick={handleNext}
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};
