import React, { useState, ChangeEvent, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Congregation } from "@/api-models/sub";

const initValue: Congregation = {
  man: 0,
  women: 0,
  online: 0,
};

interface CongregationFormProps {
  initialData: Congregation;
  onSubmit: (data: Congregation) => void;
  userPID: string;
}

export const CongregationForm: React.FC<CongregationFormProps> = ({
  initialData = initValue,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Congregation>(initialData);

  useEffect(() => {
    onSubmit(formData);
  }, [formData, onSubmit]);

  const isValidNumber = (value: string): boolean => {
    // 빈 문자열 허용
    if (value === "") return true;

    // 정수 패턴 검사 (양수만)
    const numberPattern = /^[0-9]+$/;
    if (!numberPattern.test(value)) return false;

    // 숫자로 변환했을 때 유효한 범위인지 검사
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 0 && num <= Number.MAX_SAFE_INTEGER;
  };

  const handleChange = (
    field: keyof Congregation,
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    if (isValidNumber(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: +value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: 0,
      }));
    }
  };

  return (
    <div className="space-y-6 mb-6">
      <div className="mb-4">
        <Label className="mb-2 block">형제 인원</Label>
        <Input
          type="number"
          min="0"
          placeholder="숫자를 입력하세요"
          value={formData.man || ""}
          onChange={(e) => handleChange("man", e)}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">자매 인원</Label>
        <Input
          type="number"
          min="0"
          placeholder="숫자를 입력하세요"
          value={formData.women || ""}
          onChange={(e) => handleChange("women", e)}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">온라인 인원</Label>
        <Input
          type="number"
          min="0"
          placeholder="숫자를 입력하세요"
          value={formData.online || ""}
          onChange={(e) => handleChange("online", e)}
        />
      </div>
    </div>
  );
};
