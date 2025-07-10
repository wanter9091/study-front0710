"use client"
import { useState } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/src/context/AuthContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function GuardianRegisterPage() {
  const router = useRouter()
  const { setGuardian } = useAuthContext()

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    phone: "",
    email: "",
    role: "GUARDIAN",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API_URL}/guardians/`, formData, { withCredentials: true })
      setGuardian(res.data)
      alert("보호자 등록 완료")
      router.push("/")
    } catch (err) {
      console.error("보호자 등록 실패", err)
      alert("등록 실패: 콘솔 확인")
    }
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">보호자 등록</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username">아이디</Label>
          <Input name="username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="name">이름</Label>
          <Input name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="phone">전화번호</Label>
          <Input name="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="email">이메일</Label>
          <Input name="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <input type="hidden" name="role" value={formData.role} />
        <Button type="submit" className="w-full">등록하기</Button>
      </form>
    </div>
  )
}
