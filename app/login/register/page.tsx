"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        "username": username,
        "password": password,
      })
      toast({ title: "회원가입 성공", description: "로그인 페이지로 이동합니다!" })
      router.push("/login")
    } catch (error: any) {
      toast({
        title: "회원가입 실패",
        description: error?.response?.data?.detail || "서버 오류",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">회원가입</h1>
        <Input
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleRegister} className="w-full">
          회원가입
        </Button>
        <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
          로그인으로 돌아가기
        </Button>
      </div>
    </div>
  )
}
