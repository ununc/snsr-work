import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../apis/auth/login";
import { members } from "@/etc/sarangbang";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { MonthDayPicker } from "@/components/SignInBirth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export const SignUpPage = () => {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    name: "",
    phone: "010",
    year: "",
    monthDay: "",
    sarang: "",
    daechung: true,
    gender: true,
  });
  const [passwordError, setPasswordError] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // 비밀번호 입력 시 유효성 검사
    if (name === "password") {
      if (value.length && value.length < 6) {
        setPasswordError("비밀번호는 6자리 이상이어야 합니다.");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleBirth = ({
    month,
    day,
  }: {
    month: number | null;
    day: number | null;
  }) => {
    if (month === null || day === null) {
      setFormData((prev) => ({ ...prev, monthDay: "" }));
      return;
    }
    const formattedMonth = month.toString().padStart(2, "0");
    const formattedDay = day.toString().padStart(2, "0");

    const monthDay = `${formattedMonth}-${formattedDay}`;
    setFormData((prev) => ({ ...prev, monthDay }));
  };

  const handleGender = () => {
    setFormData((prevState) => ({ ...prevState, gender: !prevState.gender }));
  };

  const handleYearChange = (yearValue: string) => {
    setFormData((prev) => ({
      ...prev,
      year: yearValue,
    }));
  };

  const handleSarangChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      sarang: name,
    }));
  };

  const handleClickOrg = (org: boolean) => {
    if (formData.daechung === org) return;
    setFormData((prev) => ({
      ...prev,
      daechung: org,
      sarang: "",
    }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 48 }, (_, i) => currentYear - i - 17);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const {
      id,
      password,
      name,
      phone,
      year,
      monthDay,
      sarang,
      daechung,
      gender,
    } = formData;
    // 회원가입 전 비밀번호 길이 검증
    if (password.length < 6) {
      toast({
        title: "비밀번호는 6자리 이상이어야 합니다.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (!year) {
      toast({
        title: "또래를 선택해 주세요",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (!monthDay) {
      toast({
        title: "생일을 선택해 주세요",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (!sarang) {
      toast({
        title: "사랑방을 선택해 주세요",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    const payload = {
      id,
      password,
      name,
      phone,
      birth: `${year}-${monthDay}`,
      sarang,
      daechung,
      gender,
    };

    try {
      await signup(payload);
      navigate("/account/login");
      alert("회원가입 완료\n로그인으로 이동합니다.");
    } catch {
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full p-8 h-full flex flex-col justify-center">
      <form onSubmit={handleSubmit} className="mt-4 space-y-8">
        <div className="space-y-3">
          <div>
            <Label htmlFor="id" className="block mb-2">
              아이디
            </Label>
            <Input
              id="id"
              name="id"
              type="text"
              required
              value={formData.id}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="password" className="block mb-2">
              비밀번호
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2">
              <Label htmlFor="name" className="block mb-2">
                이름
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-3">
              <Label htmlFor="phone" className="block mb-2">
                전화번호
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-3">
              <Label htmlFor="phone" className="block mb-2">
                성별
              </Label>
              <Button
                type="button"
                onClick={handleGender}
                variant="outline"
                className="w-full"
              >
                {formData.gender ? "남" : "여"}
              </Button>
            </div>
            <div className="col-span-4">
              <Label htmlFor="phone" className="block mb-2">
                또래
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full" type="button">
                    {formData.year ? formData.year : "또래 선택"}
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

          <div className="flex justify-between items-center gap-3">
            <div className="">
              <Label htmlFor="phone" className="block mb-2">
                소속
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.daechung ? "default" : "outline"}
                  className="w-full px-3"
                  onClick={() => handleClickOrg(true)}
                >
                  대학부
                </Button>
                <Button
                  type="button"
                  variant={formData.daechung ? "outline" : "default"}
                  className="w-full px-3"
                  onClick={() => handleClickOrg(false)}
                >
                  청년부
                </Button>
              </div>
            </div>

            <div className="w-full">
              <Label htmlFor="phone" className="block mb-2">
                사랑방
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" className="w-full">
                    {formData.sarang ? formData.sarang : "사랑방 선택"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-36 min-w-36 overflow-y-scroll">
                  {formData.daechung
                    ? members.c.map((name) => (
                        <DropdownMenuItem
                          key={name}
                          onSelect={() => handleSarangChange(name)}
                        >
                          <div className="text-center w-full">{name}</div>
                        </DropdownMenuItem>
                      ))
                    : members.y.map((name) => (
                        <DropdownMenuItem
                          key={name}
                          onSelect={() => handleSarangChange(name)}
                        >
                          <div className="text-center w-full">{name}</div>
                        </DropdownMenuItem>
                      ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full">
          회원가입
        </Button>
      </form>

      <div className="text-center mt-4 mb-16">
        <Link to="/account/login" className="text-sm text-primary">
          로그인
        </Link>
      </div>
    </div>
  );
};
