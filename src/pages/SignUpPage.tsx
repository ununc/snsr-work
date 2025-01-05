import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../apis/auth/login";
import { members } from "@/etc/sarangbang";

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
  const [passwordError, setPasswordError] = useState<string>("");
  const navigate = useNavigate();

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
      if (value.length < 6) {
        setPasswordError("비밀번호는 6자리 이상이어야 합니다.");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 회원가입 전 비밀번호 길이 검증
    if (formData.password.length < 6) {
      alert("비밀번호는 6자리 이상이어야 합니다.");
      return;
    }

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
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
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
