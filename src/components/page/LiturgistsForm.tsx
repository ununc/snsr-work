import React, { useState, ChangeEvent, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Liturgists } from "@/api-models/sub";

interface LiturgyFormProps {
  initialData: Liturgists;
  onSubmit: (data: Liturgists) => void;
  userPID: string;
}

export const LiturgistsForm: React.FC<LiturgyFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Liturgists>(initialData);

  useEffect(() => {
    onSubmit(formData);
  }, [formData, onSubmit]);

  const handleChange = (
    field: keyof Liturgists,
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const calculateRows = (text: string) => {
    if (!text) return 1;
    return (text.match(/\n/g) || []).length + 1;
  };
  return (
    <div className="space-y-6 mb-6">
      <div className="mb-4">
        <Label className="mb-2 block">예배 인도</Label>
        <Input
          placeholder="이름을 입력하세요"
          value={formData.worship}
          onChange={(e) => handleChange("worship", e)}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">설교 요약</Label>
        <Input
          placeholder="이름을 입력하세요"
          value={formData.sermon}
          onChange={(e) => handleChange("sermon", e)}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">찬양 인도</Label>
        <Input
          placeholder="이름을 입력하세요"
          value={formData.praise}
          onChange={(e) => handleChange("praise", e)}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">자막</Label>
        <Input
          placeholder="이름을 입력하세요"
          value={formData.subtitle}
          onChange={(e) => handleChange("subtitle", e)}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">특송자</Label>
        <Input
          placeholder="이름을 입력하세요"
          value={formData.specialSong}
          onChange={(e) => handleChange("specialSong", e)}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">영상</Label>
        <Input
          placeholder="이름을 입력하세요"
          value={formData.video}
          onChange={(e) => handleChange("video", e)}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">음향</Label>
        <Input
          placeholder="이름을 입력하세요"
          value={formData.sound}
          onChange={(e) => handleChange("sound", e)}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">기타</Label>
        <Textarea
          placeholder="기타 내용을 입력하세요"
          value={formData.others}
          onChange={(e) => handleChange("others", e)}
          rows={calculateRows(formData.others)}
        />
      </div>
    </div>
  );
};
