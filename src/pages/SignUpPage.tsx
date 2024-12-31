import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../apis/auth/login";

interface SignUpForm {
  id: string;
  password: string;
  name: string;
  email: string | null;
  phone: string;
  birth: string;
  sarang: string;
  daechung: string;
}

const members = {
  c: [
    "이승태",
    "박은비",
    "박진유",
    "박정경",
    "배성광",
    "이예지",
    "이주헌",
    "전도영",
    "정창대",
    "허예인",
    "새가족",
  ],
  y: [
    "김민경",
    "강성전",
    "김정민",
    "신현교",
    "염기현",
    "최우형",
    "고아라",
    "김윤주",
    "서한솔",
    "주효민",
    "새가족",
  ],
};

export const SignUpPage = () => {
  const [formData, setFormData] = useState<SignUpForm>({
    id: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    birth: "",
    sarang: "",
    daechung: "대학부",
  });
  const navigate = useNavigate();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        daechung: formData.daechung === "대학부",
      };
      if (!payload.email) {
        payload.email = null;
      }
      await signup(payload);
      navigate("/account/login");
      alert("회원가입 완료\n로그인으로 이동합니다.");
    } catch {
      alert("회원가입 중 오류가 발생했습니다.");
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
              value={formData.id}
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
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div className="flex gap-3">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                전화번호
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              />
            </div>
          </div>
          {/* <div>
            <label htmlFor="email" className="block text-sm font-medium">
              이메일 (선택)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div> */}

          <div className="w-full">
            <label htmlFor="birth" className="block text-sm font-medium">
              생년월일
            </label>
            <input
              id="birth"
              name="birth"
              type="date"
              required
              value={formData.birth}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="w-1/2 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="daechung"
                  value="대학부"
                  checked={formData.daechung === "대학부"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>대학부</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="daechung"
                  value="청년부"
                  checked={formData.daechung === "청년부"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>청년부</span>
              </label>
            </div>
            <div className="w-1/2">
              <select
                id="sarang"
                name="sarang"
                required
                value={formData.sarang}
                onChange={handleChange}
                className="mt-1 block w-full h-11 rounded-md border border-gray-300 p-2"
              >
                <option value="">사랑방을 선택하세요</option>
                {formData.daechung === "청년부"
                  ? members.y.map((name) => (
                      <option key={name} value={name}>
                        {name} 사랑방
                      </option>
                    ))
                  : members.c.map((name) => (
                      <option key={name} value={name}>
                        {name} 사랑방
                      </option>
                    ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          회원가입
        </button>
      </form>

      <div className="text-center mt-4 mb-20">
        <Link
          to="/account/login"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          로그인
        </Link>
      </div>
    </div>
  );
};
