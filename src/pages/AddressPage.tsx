import {
  getAdress,
  getNewRoleMenu,
  passwordChange,
  updateRequestUserInfo,
} from "@/apis/auth/login";
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
import {
  Phone,
  Mail,
  ChevronRight,
  Pencil,
  RefreshCw,
  Download,
  BellRing,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/stores/global.store";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useServiceWorkerStore } from "@/stores/serviceWorkerStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { sendSubscription } from "@/apis/push/subscribe";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { compressUntilSize } from "@/util/compress";
import { MonthDayPicker } from "@/components/SignInBirth";

interface Contact {
  role: string;
  user: {
    name: string;
    phone: string;
    email: string;
    daechung: boolean;
    profile_image: string;
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

const strictEmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

export const AddressPage = () => {
  const [accordion, setAccordion] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [myPage, setMyPage] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newProfile, setNewProfile] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newBirth, setNewBirth] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    userInfo,
    menuList,
    roleNames,
    autoLogin,
    clearUserData,
    updateMenuList,
    updateRoleNames,
  } = useGlobalStore();
  const { checkForUpdates, initGetRegister } = useServiceWorkerStore();
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
    // setPermission(Notification.permission);
    getAddresses();
  }, []);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "복사 완료",
        description: `${type}가 복사되었습니다.`,
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

  const checkUpdate = async () => {
    await checkForUpdates();
  };

  const checkAlert = async () => {
    try {
      // 서비스 워커 지원 확인
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("브라우저가 푸시 알림을 지원하지 않습니다");
      }

      const registration = await initGetRegister();
      // 권한 요청
      const permission = await Notification.requestPermission();
      if (!registration) return;

      if (permission === "granted") {
        // 서비스워커 등록 확인

        // VAPID 키는 환경변수나 설정에서 가져오기
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        // 푸시 구독
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        // 서버에 구독 정보 전송
        await sendSubscription(subscription);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  };

  const handleEdit = () => {
    setIsEdit(true);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 48 }, (_, i) => currentYear - i - 17);

  const handleChangePass = async () => {
    try {
      await passwordChange({
        oldPassword,
        newPassword,
      });
      handleLogout();
    } catch {
      toast({
        title: "비밀번호 변경 실패",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleChangeEmail = async () => {
    try {
      await updateRequestUserInfo({
        pid: userInfo!.pid,
        email: newEmail,
      });
      handleLogout();
    } catch {
      toast({
        title: "이메일 변경 실패",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleChangePhone = async () => {
    try {
      await updateRequestUserInfo({
        pid: userInfo!.pid,
        phone: newPhone,
      });
      handleLogout();
    } catch {
      toast({
        title: "전화번호 변경 실패",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleChangeProfile = async () => {
    try {
      await updateRequestUserInfo({
        pid: userInfo!.pid,
        profile_image: newProfile,
      });
      handleLogout();
    } catch {
      toast({
        title: "프로필 사진 변경 실패",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleChangeBirth = async () => {
    try {
      await updateRequestUserInfo({
        pid: userInfo!.pid,
        birth: `${newYear}-${newBirth}`,
      });
      handleLogout();
    } catch {
      toast({
        title: "또래 / 생일 변경 실패",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressedFile = await compressUntilSize(file, 0.09);
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewProfile(event.target?.result as string);
    };
    reader.onerror = () => {
      toast({
        title: "프로필 사진 올리기 실패",
        variant: "destructive",
        duration: 2000,
      });
    };
    reader.readAsDataURL(compressedFile as File);
  };

  const handleYearChange = (yearValue: string) => {
    setNewYear(yearValue);
  };

  const handleBirth = ({
    month,
    day,
  }: {
    month: number | null;
    day: number | null;
  }) => {
    if (month === null || day === null) {
      setNewBirth("");
      return;
    }
    const formattedMonth = month.toString().padStart(2, "0");
    const formattedDay = day.toString().padStart(2, "0");

    const monthDay = `${formattedMonth}-${formattedDay}`;
    setNewBirth(monthDay);
  };

  const roleMenuUpdate = async () => {
    const data = await getNewRoleMenu(userInfo?.pid ?? "");
    updateMenuList(data.menuList);
    updateRoleNames(data.roleNames);
  };

  const changeAccordion = (data: string) => {
    setNewEmail("");
    setNewPhone("");
    setNewProfile("");
    setOldPassword("");
    setNewPassword("");
    setNewBirth("");
    setNewYear("");
    setAccordion(data);
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

  if (isEdit) {
    return (
      <div className="page-wrapper">
        <div className="page-body space-y-2">
          <Label className="text-xl font-bold">정보 변경</Label>
          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={accordion}
            onValueChange={changeAccordion}
          >
            <AccordionItem value="item-1">
              <AccordionTrigger>이메일 변경</AccordionTrigger>
              <AccordionContent>
                <div className="p-2">
                  <Label className="block mb-2">기존 이메일</Label>
                  <Input value={userInfo?.email ?? "정보 없음"} readOnly />
                  <Label className="block mt-4 mb-2">새 이메일</Label>
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    onClick={handleChangeEmail}
                    disabled={!strictEmailRegex.test(newEmail)}
                  >
                    이메일 수정하기
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>프로필 사진 변경</AccordionTrigger>
              <AccordionContent>
                <div className="p-2">
                  <div className="flex justify-center items-center gap-8">
                    <div>
                      <Label className="block mb-2">기존 프로필 사진</Label>
                      <Avatar className="w-36 h-36">
                        <AvatarImage
                          src={userInfo?.profile_image}
                          alt="profile"
                        />
                        <AvatarFallback>이미지 없음</AvatarFallback>
                      </Avatar>
                    </div>
                    <div
                      onClick={() => {
                        const input = document.getElementById("image-upload");
                        if (input) {
                          input.click();
                        }
                      }}
                    >
                      <Label className="block mb-2">새 프로필 사진</Label>
                      <Avatar className="w-36 h-36">
                        <AvatarImage src={newProfile} alt="profile" />
                        <AvatarFallback>이미지 없음</AvatarFallback>
                      </Avatar>
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    onClick={handleChangeProfile}
                    disabled={!newProfile}
                  >
                    프로필 사진 수정하기
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>전화번호 변경</AccordionTrigger>
              <AccordionContent>
                <div className="p-2">
                  <Label className="block mb-2">기존 전화번호</Label>
                  <Input value={userInfo?.phone ?? "정보 없음"} readOnly />
                  <Label className="block mt-4 mb-2">새 전화번호</Label>
                  <Input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    onClick={handleChangePhone}
                    disabled={newPhone.length <= 9}
                  >
                    전화번호 수정하기
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>또래 / 생일 변경</AccordionTrigger>
              <AccordionContent>
                <div className="p-2">
                  <Label className="block mb-2">기존 정보</Label>

                  <Input value={userInfo?.birth ?? "정보 없음"} readOnly />
                  <Label className="block mt-4 mb-2">새 정보</Label>
                  <div className="grid grid-cols-9 gap-3">
                    <div className="col-span-4">
                      <Label htmlFor="phone" className="block mb-2">
                        또래
                      </Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full"
                            type="button"
                          >
                            {newYear ? newYear : "또래 선택"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-36 min-w-24 overflow-y-scroll">
                          {years.map((year) => (
                            <DropdownMenuItem
                              key={year}
                              onSelect={() => handleYearChange(year.toString())}
                            >
                              <div className="text-center w-full">{year}</div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="col-span-5">
                      <Label htmlFor="phone" className="block mb-2">
                        생일
                      </Label>
                      <MonthDayPicker onChange={handleBirth} />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    onClick={handleChangeBirth}
                    disabled={!newYear || !newBirth}
                  >
                    또래 / 생일 수정하기
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>비밀번호 변경</AccordionTrigger>
              <AccordionContent>
                <div className="p-2">
                  <Label className="block mb-2">기존 비밀번호</Label>

                  <Input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <Label className="block mt-4 mb-2">새 비밀번호</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    onClick={handleChangePass}
                    disabled={oldPassword.length < 6 || newPassword.length < 6}
                  >
                    비밀 번호 수정하기
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>기타</AccordionTrigger>
              <AccordionContent>
                <div>개인 정보 변경, 기타 문의 사항은</div>
                <div>국장 혹은 운영자에게 이야기 부탁드립니다.</div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <Button
          variant="ghost"
          className="w-full flex justify-start mt-2 items-center gap-2"
          onClick={() => setIsEdit(false)}
        >
          <ChevronRight className="h-4 w-4 rotate-180" />내 정보로 돌아가기
        </Button>
      </div>
    );
  }

  if (myPage) {
    return (
      <div className="page-wrapper">
        <Card className="page-body">
          <div className="flex justify-start items-center px-4 pt-6 gap-6 relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={userInfo?.profile_image} alt="profile" />
              <AvatarFallback>이미지 없음</AvatarFallback>
            </Avatar>
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
                {userInfo?.email ?? "이메일 없음"}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="absolute px-2.5 top-4 right-2.5"
                >
                  <Pencil className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 space-y-2">
                <DropdownMenuItem
                  onClick={handleEdit}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  정보 수정
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={roleMenuUpdate}
                  className="cursor-pointer"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  정보 리로드
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={checkUpdate}
                  className="cursor-pointer"
                >
                  <Download className="mr-2 h-4 w-4" />앱 업데이트
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={checkAlert}
                  className="cursor-pointer"
                >
                  <BellRing className="mr-2 h-4 w-4" /> 알림 설정
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardContent className=" p-5">
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
                      : "정보 없음"}
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
                  {roleNames?.map((group) => (
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
                  {menuList?.map((menu) => (
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
          className="w-full flex justify-start mt-2 items-center gap-2"
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
                      className="hover:bg-accent/50 transition-colors py-3 px-1.5 rounded-lg"
                    >
                      <div className="flex justify-start items-center gap-3">
                        <Avatar className="w-16 h-16">
                          <AvatarImage
                            src={user?.profile_image}
                            alt="profile"
                          />
                          <AvatarFallback>
                            <Image />
                          </AvatarFallback>
                        </Avatar>
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
                            <button
                              className="flex items-center gap-1"
                              onClick={() =>
                                copyToClipboard(user.phone, "전화번호")
                              }
                            >
                              <Phone className="w-4 h-4" />
                              {user.phone}
                            </button>
                            {user.email && (
                              <button
                                className="flex items-center gap-1 mt-1"
                                onClick={() =>
                                  copyToClipboard(user.email, "이메일")
                                }
                              >
                                <Mail className="w-4 h-4" />
                                {user.email}
                              </button>
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
