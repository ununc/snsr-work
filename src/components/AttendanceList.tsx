import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Attendance } from "@/apis/leaderreport/report";

interface AttendanceListProps {
  attendances: Attendance[];
  isAllExpanded?: boolean;
  editable?: boolean;
  onAttendancesChange?: React.Dispatch<
    React.SetStateAction<Attendance[] | null>
  >;
}

const STATUS_DISPLAY = {
  NO: "불참",
  WORSHIP: "예배만",
  CELL: "사랑방만",
  ALL: "전참",
} as const;

const getStatusBadgeColor = (status: Attendance["status"]) => {
  switch (status) {
    case "ALL":
      return "bg-green-500";
    case "WORSHIP":
      return "bg-blue-500";
    case "CELL":
      return "bg-yellow-500";
    case "NO":
      return "bg-red-500";
    default:
      return "bg-red-500";
  }
};

export const AttendanceList = ({
  attendances,
  isAllExpanded = true,
  editable = false,
  onAttendancesChange,
}: AttendanceListProps) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const newExpandedState = attendances.reduce((acc, attendance) => {
      acc[attendance.id] = isAllExpanded;
      return acc;
    }, {} as Record<string, boolean>);

    setExpandedItems(newExpandedState);
  }, [isAllExpanded, attendances]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAttendanceChange = (
    id: string,
    field: keyof Attendance,
    value: string
  ) => {
    const updatedAttendances = attendances.map((attendance) =>
      attendance.id === id ? { ...attendance, [field]: value } : attendance
    );
    onAttendancesChange?.(updatedAttendances);
  };

  const renderField = (
    attendance: Attendance,
    field: "lifeSharing" | "faith" | "notes",
    label: string
  ) => {
    if (editable) {
      return (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1 mt-4">
            {label}
          </h4>
          <Textarea
            value={attendance[field]}
            onChange={(e) =>
              handleAttendanceChange(attendance.id, field, e.target.value)
            }
            className="min-h-[100px]"
          />
        </div>
      );
    }

    if (!attendance[field]) return null;

    return (
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-1 mt-4">{label}</h4>
        <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
          {attendance[field]}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {attendances.map((attendance) => (
        <Card key={attendance.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{attendance.memberName}</h3>
              <div className="flex items-center gap-2">
                {editable ? (
                  <Select
                    value={attendance.status}
                    onValueChange={(value: Attendance["status"]) =>
                      handleAttendanceChange(attendance.id, "status", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue
                        placeholder={STATUS_DISPLAY[attendance.status]}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NO">{STATUS_DISPLAY.NO}</SelectItem>
                      <SelectItem value="WORSHIP">
                        {STATUS_DISPLAY.WORSHIP}
                      </SelectItem>
                      <SelectItem value="CELL">
                        {STATUS_DISPLAY.CELL}
                      </SelectItem>
                      <SelectItem value="ALL">{STATUS_DISPLAY.ALL}</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusBadgeColor(attendance.status)}>
                    {STATUS_DISPLAY[attendance.status]}
                  </Badge>
                )}
                <button
                  onClick={() => toggleExpand(attendance.id)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {expandedItems[attendance.id] ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {expandedItems[attendance.id] && (
              <div className="space-y-3">
                {renderField(attendance, "lifeSharing", "생명나눔")}
                {renderField(attendance, "faith", "신앙")}
                {renderField(attendance, "notes", "노트")}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
