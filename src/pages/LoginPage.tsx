import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Credentials, login } from "../apis/auth/login";
import { useUserStore } from "../stores/userInfo.store";

export const LoginPage = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    id: "",
    password: "",
  });
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { userInfo, menuList } = await login(credentials);
      userInfo.autoLogin = true;
      userInfo.menuList = menuList;
      setUser(userInfo);
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
            <label htmlFor="id" className="block text-sm font-medium">
              아이디
            </label>
            <input
              id="id"
              name="id"
              type="text"
              required
              value={credentials.id}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={credentials.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          로그인
        </button>
      </form>

      <div className="text-center mt-4 mb-28">
        <Link
          to="/account/signin"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
};
