"use client"

import axios from "axios"
import { useState } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, ArrowLeft, UserPlus, Heart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

export default function PatientRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { guardian } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    birthdate: "",
    gender: "",
    blood_type: "",
    memo: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.name || !formData.birthdate) {
      toast({
        title: "필수 정보 누락",
        description: "이름과 생년월일을 입력해주세요.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      console.log(guardian?.id)
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/patients/`, {
        ...formData,
        guardian_id: guardian?.id,
      })

      toast({
        title: "등록 성공 🎉",
        description: "환자 정보가 등록되었습니다.",
      })
      router.push("/patients")
    } catch (error) {
      toast({
        title: "등록 실패",
        description: "서버 오류가 발생했습니다.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return ""
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/patients">
              <ArrowLeft className="h-4 w-4 mr-1" />
              돌아가기
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">새 환자 등록</h1>
              <p className="text-muted-foreground">환자 정보를 입력하세요 👶</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950">
          <Heart className="h-3 w-3 mr-1" />
          신규 등록
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">기본 정보</CardTitle>
            <CardDescription>환자의 기본 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="이름 입력"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdate">생년월일 *</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => handleInputChange("birthdate", e.target.value)}
                />
                {formData.birthdate && (
                  <Badge variant="secondary">
                    나이: {calculateAge(formData.birthdate)}세
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">성별</Label>
                <Select value={formData.gender} onValueChange={(val) => handleInputChange("gender", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="성별 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">남자</SelectItem>
                    <SelectItem value="female">여자</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood_type">혈액형</Label>
                <Select value={formData.blood_type} onValueChange={(val) => handleInputChange("blood_type", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="혈액형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="AB">AB</SelectItem>
                    <SelectItem value="O">O</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memo">메모</Label>
              <Textarea
                id="memo"
                value={formData.memo}
                onChange={(e) => handleInputChange("memo", e.target.value)}
                placeholder="기타 특이사항 입력"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "등록"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/patients">취소</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
