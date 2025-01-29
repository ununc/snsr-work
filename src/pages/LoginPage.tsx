import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Credentials, login } from "../apis/auth/login";
import { useGlobalStore } from "@/stores/global.store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SquareCheck, SquareDashed } from "lucide-react";

export const LoginPage = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    id: "",
    password: "",
  });
  const [autoLogin, setAutoLogin] = useState(false);
  const navigate = useNavigate();
  const { setUserData } = useGlobalStore();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { userInfo, menuList, roleNames, access_token } = await login(
        credentials
      );

      setUserData(userInfo, menuList, roleNames, access_token, autoLogin);
      navigate("/calendar");
    } catch {
      alert("로그인에 실패했습니다.");
    }
  };

  return (
    <div className="w-full p-8 h-full flex flex-col justify-center">
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="id" className="block mb-2">
              아이디
            </Label>
            <Input
              id="id"
              name="id"
              type="text"
              required
              value={credentials.id}
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
              value={credentials.password}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center">
            <input
              id="autoLogin"
              name="autoLogin"
              type="checkbox"
              checked={autoLogin}
              onChange={(e) => setAutoLogin(e.target.checked)}
              className="h-0 w-0"
            />

            <Label
              htmlFor="autoLogin"
              className="flex gap-1.5 items-center text-sm"
            >
              {autoLogin ? (
                <SquareCheck className="w-5 h-5" />
              ) : (
                <SquareDashed className="w-5 h-5" />
              )}
              로그인 유지
            </Label>
          </div>
        </div>

        <Button type="submit" className="w-full">
          로그인
        </Button>
      </form>

      <div className="text-center mt-4 mb-28">
        <Link to="/account/signin" className="text-sm text-primary">
          회원가입
        </Link>
      </div>
    </div>
  );
};
