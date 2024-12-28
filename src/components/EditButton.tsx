import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface EditButtonProps {
  onClick?: () => void;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "secondary" | "outline" | "ghost";
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const EditButton: React.FC<EditButtonProps> = ({
  onClick,
  size = "default",
  variant = "secondary",
  disabled = false,
  className = "",
  children,
}) => {
  return (
    <Button
      onClick={onClick}
      size={size}
      variant={variant}
      disabled={disabled}
      className={`flex items-center gap-2 ${className}`}
    >
      <Pencil className="h-4 w-4" />
      {children || "수정"}
    </Button>
  );
};
