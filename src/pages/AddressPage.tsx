import { getAdress } from "@/apis/auth/login";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, UserCircle, Mail, ChevronRight } from "lucide-react";
import { useUserStore } from "@/stores/userInfo.store";
import { Button } from "@/components/ui/button";

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
  const { user } = useUserStore();
  useEffect(() => {
    const getAddresses = async () => {
      try {
        if (!user) return;
        setError(null);
        const response = await getAdress({
          daechung: user.daechung,
          sarang: user.sarang,
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

  return (
    <div className="overflow-hidden h-full">
      <div className="w-full flex justify-between mt-6 px-4 mb-4">
        <Label className="text-xl font-bold">대학 청년부 연락처</Label>
        <Button variant="outline" className="flex items-center gap-2">
          내 정보
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className=" h-[calc(100dvh-11.5rem)] overflow-y-auto px-4">
        <div className="space-y-3">
          {contacts.map((contact) => (
            <Card key={contact.role}>
              <CardContent className="p-4">
                <div className="text-lg font-semibold mb-3">{contact.role}</div>
                <div className="space-y-3">
                  {contact.user.map((user) => (
                    <div
                      key={user.phone}
                      className="hover:bg-accent/50 transition-colors p-3 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <UserCircle className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{user.name}</span>
                            {user.daechung ? (
                              <Badge className="bg-blue-500">대학부</Badge>
                            ) : (
                              <Badge variant="outline">청년부</Badge>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {user.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {user.email}
                            </div>
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
