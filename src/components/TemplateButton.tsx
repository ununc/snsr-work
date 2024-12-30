import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Template {
  id: string;
  title: string;
}

interface TemplateButtonProps {
  templates: Template[];
  onSelectTemplate: (template: string) => void;
}

export const TemplateButton = ({
  templates,
  onSelectTemplate,
}: TemplateButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-32" variant="outline">
          템플릿 사용
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32 p-1.5 space-y-2" align="end">
        {templates.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className="text-sm"
          >
            {template.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
