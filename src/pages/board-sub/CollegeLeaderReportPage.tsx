import {
  Attendance,
  createReport,
  getOneReports,
  getReportsByDate,
  updateReport,
  type Leaders,
} from "@/apis/leaderreport/report";
import {
  getSarangbangByPid,
  type Sarangbang,
} from "@/apis/sarangbang/sarangbang";
import { AttendanceList } from "@/components/AttendanceList";
import { BogoSelect } from "@/components/BogoSelect";
import { EditButton } from "@/components/EditButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useGlobalStore } from "@/stores/global.store";
import { ChevronRight } from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

export const CollegeLeaderReportPage = ({
  daechung,
}: {
  daechung: boolean;
}) => {
  const { userInfo } = useGlobalStore();
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek >= 4 ? 7 - dayOfWeek : -dayOfWeek;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + diff);
    return sunday;
  });

  const [lists, setLists] = useState<Leaders[]>([]);
  const [attendances, setAttendances] = useState<Attendance[] | null>(null);
  const [newAttendances, setNewAttendances] = useState<Attendance[] | null>(
    null
  );
  const [expendAll, setExpendAll] = useState<boolean>(true);
  const [editable, setEditable] = useState<boolean>(false);
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const currentUserId = userInfo?.pid; // 실제 인증 시스템에서 가져와야 할 사용자 ID
  const formattedDate = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [selectedDate]);
  const isProcessingRef = useRef(false);

  // 선택된 날짜의 글 목록을 가져오는 함수
  const fetchLists = async () => {
    if (!userInfo) return;
    const list = await getReportsByDate(daechung, formattedDate);
    setLists(list);
  };

  const handleClickReport = async (pid: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      const [sarangbang, reports] = await Promise.all([
        getSarangbangByPid(pid),
        getOneReports(daechung, formattedDate, pid),
      ]);
      setAttendances(sortAttendanceRecords(reports, sarangbang));
    } catch {
      console.error("요청 실패");
    } finally {
      isProcessingRef.current = false;
    }
  };

  const createEmptyAttendances = (sarangbang: Sarangbang): Attendance[] => {
    const attendances: Attendance[] = [];

    // Add leader first
    attendances.push({
      id: `${formattedDate}-${sarangbang.leaderPid}`,
      leaderPid: sarangbang.leaderPid,
      leaderName: sarangbang.leaderName,
      memberPid: sarangbang.leaderPid,
      memberName: sarangbang.leaderName,
      attendanceDate: new Date(formattedDate),
      status: "NO",
      lifeSharing: "",
      faith: "",
      notes: "",
      daechung,
    });

    // Add members in order
    sarangbang.members.forEach((member) => {
      if (member.pid !== sarangbang.leaderPid) {
        attendances.push({
          id: `${formattedDate}-${member.pid}`,
          leaderPid: sarangbang.leaderPid,
          leaderName: sarangbang.leaderName,
          memberPid: member.pid,
          memberName: member.name,
          attendanceDate: new Date(formattedDate),
          status: "NO",
          lifeSharing: "",
          faith: "",
          notes: "",
          daechung,
        });
      }
    });

    return attendances;
  };

  const handleCreate = async () => {
    if (!userInfo || isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      const sarangbang = await getSarangbangByPid(userInfo.pid);
      const emptyAttendances = createEmptyAttendances(sarangbang);
      setAttendances(emptyAttendances);
      setNewAttendances(emptyAttendances);
      setIsCreate(true);
      setEditable(true);
    } catch (error) {
      console.error("Failed to create new report:", error);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const sortAttendanceRecords = (
    attendanceData: Attendance[],
    groupInfo: Sarangbang
  ) => {
    if (!attendanceData?.length || !groupInfo) {
      return [];
    }
    return attendanceData.sort((a, b) => {
      // 1. 리더 체크
      const isLeaderA =
        a.leaderPid === a.memberPid || a.memberPid === groupInfo.leaderPid;
      const isLeaderB =
        b.leaderPid === b.memberPid || b.memberPid === groupInfo.leaderPid;

      if (isLeaderA && !isLeaderB) return -1;
      if (!isLeaderA && isLeaderB) return 1;
      if (isLeaderA && isLeaderB) return 0;

      // 2. members 배열에서의 인덱스 찾기
      const findMemberIndex = (record: Attendance) => {
        if (record.memberPid) {
          return groupInfo.members.findIndex((m) => m.pid === record.memberPid);
        }
        return groupInfo.members.findIndex((m) => m.name === record.memberName);
      };

      const indexA = findMemberIndex(a);
      const indexB = findMemberIndex(b);

      // 3. 둘 다 members 배열에 있는 경우
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // 4. members 배열에 없는 경우는 뒤로 보내고 이름순으로 정렬
      if (indexA === -1 && indexB === -1) {
        return a.memberName.localeCompare(b.memberName);
      }

      // 5. members 배열에 있는 것을 우선순위로
      return indexA === -1 ? 1 : -1;
    });
  };

  const backToReport = () => {
    setAttendances(null);
  };

  useEffect(() => {
    fetchLists();
    setAttendances(null);
    setNewAttendances(null);
    setIsCreate(false);
    setEditable(false);
  }, [selectedDate, daechung]);

  const handleCancel = () => {
    if (isCreate) {
      setAttendances(null);
    }
    setIsCreate(false);
    setEditable(false);
    setNewAttendances(null); // 수정된 데이터 초기화
  };

  const findChangedAttendances = (
    oldAttendances: Attendance[],
    newAttendances: Attendance[]
  ): Attendance[] => {
    return newAttendances.filter((newAttendance) => {
      const oldAttendance = oldAttendances.find(
        (old) => old.id === newAttendance.id
      );

      if (!oldAttendance) return false;

      // 비교할 필드들을 배열로 정의
      const fieldsToCompare: (keyof Attendance)[] = [
        "status",
        "lifeSharing",
        "faith",
        "notes",
      ];

      // 하나라도 변경된 필드가 있는지 확인
      return fieldsToCompare.some(
        (field) => oldAttendance[field] !== newAttendance[field]
      );
    });
  };

  const handleSave = async () => {
    if (!newAttendances || !attendances || isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      if (isCreate) {
        await createReport(newAttendances);
        fetchLists();
        handleCancel();
      } else {
        const changedAttendances = findChangedAttendances(
          attendances,
          newAttendances
        );
        if (changedAttendances.length > 0) {
          // 변경된 항목이 있는 경우만 API 호출
          await updateReport(changedAttendances);
          setAttendances(newAttendances);
          setEditable(false);
          setNewAttendances(null);
        } else {
          // 변경사항이 없는 경우
          setEditable(false);
          setNewAttendances(null);
        }
      }
    } catch (error) {
      console.error("Failed to update attendances:", error);
    } finally {
      isProcessingRef.current = false;
    }
  };

  if (attendances !== null) {
    if (attendances.length) {
      const { leaderName, leaderPid } = attendances[0];
      return (
        <div className="page-wrapper">
          <div className="h-9 flex justify-between items-center mb-4">
            <Label className="text-xl font-bold">
              {formattedDate} {leaderName} 사랑방
            </Label>
            <Button
              variant="ghost"
              className=" flex justify-start items-center gap-2"
              onClick={() => {
                setExpendAll((prev) => !prev);
              }}
            >
              {expendAll ? "전체 접기" : "전체 펴기"}
            </Button>
          </div>
          <div className="page-body">
            <AttendanceList
              attendances={
                editable ? newAttendances || attendances : attendances
              }
              isAllExpanded={expendAll}
              editable={editable}
              onAttendancesChange={setNewAttendances}
            />
          </div>
          {editable ? (
            <div className="flex w-full items-center justify-end mt-4 gap-2">
              <Button variant="destructive" onClick={handleCancel}>
                취소
              </Button>
              <Button onClick={handleSave}>저장</Button>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between mt-4">
              <Button
                variant="ghost"
                className=" flex justify-start items-center gap-2"
                onClick={backToReport}
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                보고서로 돌아가기
              </Button>
              {currentUserId === leaderPid && (
                <EditButton
                  onClick={() => {
                    setNewAttendances(attendances);
                    setEditable(true);
                  }}
                >
                  수정
                </EditButton>
              )}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="page-wrapper">
        <div className="page-body">
          <div>데이터가 없습니다. 요청 확인이 필요합니다.</div>
        </div>
        <Button
          variant="ghost"
          className="w-full flex justify-start mt-4 items-center gap-2"
          onClick={backToReport}
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          보고서로 돌아가기
        </Button>
      </div>
    );
  }
  const hasUserWritten = lists.some((item) => item.leaderPid === currentUserId);
  return (
    <div className="page-wrapper">
      <div className="h-9 flex items-center mb-4">
        <Label className="text-xl font-bold">
          {daechung ? "대학" : "청년"}부 리더 보고
        </Label>
      </div>
      <div className="page-body">
        <div className="space-y-4">
          {lists.map((item) => (
            <button
              key={item.leaderPid}
              className="block w-full text-start p-4 border rounded-lg shadow-sm cursor-pointer"
              onClick={() => handleClickReport(item.leaderPid)}
            >
              <h3 className="text-lg font-medium">
                {formattedDate} {item.leaderName}
              </h3>
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <BogoSelect
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        <Button disabled={hasUserWritten} onClick={handleCreate}>
          작성하기
        </Button>
      </div>
    </div>
  );
};
