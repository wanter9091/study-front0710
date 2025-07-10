"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthContext } from "@/src/context/AuthContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function LoginPage() {
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuthContext()
  const router = useRouter()

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username: id, password })
      const token = res.data.token
      if (!token) throw new Error("토큰 없음")
      await login(token)
      router.push("/")
    } catch (e: any) {
      console.log("로그인 실패:", e.response?.data || e.message)
      alert("로그인 실패")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm p-8 border rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
        <input
          placeholder="아이디"
          className="border p-2 mb-4 w-full rounded"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="border p-2 mb-4 w-full rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-3"
        >
          로그인
        </button>
        <p className="text-center text-sm">
          계정이 없으신가요?{" "}
          <Link href="/login/register" className="text-blue-600 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
