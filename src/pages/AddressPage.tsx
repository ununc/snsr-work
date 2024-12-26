import { getAdress } from "@/apis/auth/login";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, UserCircle, Mail, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/stores/global.store";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Contact {
  role: string;
  user: {
    name: string;
    phone: string;
    email: string;
    daechung: boolean;
  }[];
}

const targetGroupNames = [
  "목사님",
  "부장집사님",
  "대표리더",
  "목양리더",
  "새가족국장",
  "미디어국장",
  "예배국장",
  "찬양국장",
  "행사국장",
  "총괄국회계",
];

export const AddressPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [myPage, setMyPage] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userInfo, autoLogin, clearUserData } = useGlobalStore();
  useEffect(() => {
    const getAddresses = async () => {
      try {
        if (!userInfo) return;
        setError(null);
        const response = await getAdress({
          daechung: userInfo.daechung,
          sarang: userInfo.sarang,
        });

        // Sort contacts based on targetGroupNames order
        const sortedContacts = [...(response || [])].sort((a, b) => {
          const indexA = targetGroupNames.indexOf(a.role);
          const indexB = targetGroupNames.indexOf(b.role);

          // If both roles are in targetGroupNames
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          // If only one role is in targetGroupNames, prioritize it
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          // If neither role is in targetGroupNames, maintain original order
          return 0;
        });

        setContacts(sortedContacts);
      } catch {
        setError("연락처를 불러오는데 실패했습니다.");
        console.error("연락처 load 실패");
      }
    };
    getAddresses();
  }, []);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "복사 완료",
        description: `${type}가 클립보드에 복사되었습니다.`,
        duration: 2000,
        className: "top-4 right-4 fixed w-54",
      });
    } catch {
      toast({
        title: "복사 실패",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive",
        duration: 2000,
        className: "top-4 left-4 fixed w-24",
      });
    }
  };

  const handleLogout = async () => {
    clearUserData();
    toast({
      title: "로그아웃",
      description: "로그아웃 되었습니다.",
      duration: 2000,
    });
    navigate("/account/login");
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-32 text-muted-foreground">
        {error}
      </div>
    );
  }

  if (!contacts.length) {
    return (
      <div className="flex justify-center items-center h-32 text-muted-foreground">
        등록된 연락처가 없습니다.
      </div>
    );
  }

  if (myPage) {
    return (
      <div className="page-wrapper">
        <Card className="page-body">
          <div className="flex justify-start items-center p-6 gap-6">
            <UserCircle className="w-12 h-12 text-primary" />
            <div className="mt-1">
              <div className="flex gap-2">
                {userInfo?.daechung ? (
                  <Badge className="bg-blue-500">대학부</Badge>
                ) : (
                  <Badge variant="outline">청년부</Badge>
                )}
                <CardTitle className="mt-0.5">{userInfo?.name}</CardTitle>
              </div>
              <CardDescription className="mt-2">
                {userInfo?.email || "이메일 없음"}
              </CardDescription>
            </div>
          </div>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      사랑방
                    </Label>
                    <div className="font-medium">{userInfo?.sarang}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">
                    전화번호
                  </Label>
                  <div className="font-medium">{userInfo?.phone}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">
                    생년월일
                  </Label>
                  <div className="font-medium">
                    {userInfo?.birth
                      ? new Date(userInfo.birth).toLocaleDateString()
                      : ""}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">
                    자동 로그인
                  </Label>
                  <div className="font-medium">{autoLogin ? "ON" : "OFF"}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">역할</Label>
                <div className="flex flex-wrap gap-2">
                  {userInfo?.role_list?.map((group) => (
                    <Badge key={group.id} variant="outline">
                      {group.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  메뉴 권한
                </Label>
                <div className="grid grid-cols-2 gap-2 min-h-16 max-h-28 overflow-y-auto">
                  {userInfo?.menuList?.map((menu) => (
                    <Badge key={menu.id} variant="outline">
                      {menu.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </CardFooter>
        </Card>

        <Button
          variant="ghost"
          className="w-full flex justify-start mt-4 items-center gap-2"
          onClick={() => setMyPage(false)}
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          연락처로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="flex justify-between items-center mb-4">
        <Label className="text-xl font-bold">대학 청년부 연락처</Label>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => {
            setMyPage(true);
          }}
        >
          내 정보
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="page-body">
        <div className="space-y-3 ">
          {contacts.map((contact) => (
            <Card key={contact.role}>
              <CardContent className="p-4">
                <div className="text-lg font-semibold mb-3">{contact.role}</div>
                <div className="space-y-1">
                  {contact.user.map((user) => (
                    <div
                      key={user.phone}
                      className="hover:bg-accent/50 transition-colors p-3 rounded-lg"
                    >
                      <div className="flex justify-start items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <UserCircle className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {user.daechung ? (
                              <Badge className="bg-blue-500">대학부</Badge>
                            ) : (
                              <Badge variant="outline">청년부</Badge>
                            )}
                            <span className="font-semibold">{user.name}</span>
                          </div>
                          <div className="flex flex-col gap-1 text-sm mt-2 pl-1 text-muted-foreground">
                            <div
                              className="flex items-center gap-1"
                              onClick={() =>
                                copyToClipboard(user.phone, "전화번호")
                              }
                            >
                              <Phone className="w-4 h-4" />
                              {user.phone}
                            </div>
                            {user.email && (
                              <div
                                className="flex items-center gap-1 mt-1"
                                onClick={() =>
                                  copyToClipboard(user.email, "이메일")
                                }
                              >
                                <Mail className="w-4 h-4" />
                                {user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
