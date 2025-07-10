"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Eye, FileText, Filter, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuthContext } from "@/src/context/AuthContext"
import { useRouter } from "next/navigation"


export type Patient = {
  id: number
  name: string
  birthdate: string
  gender: string
  memo: string | null
  blood_type: string | null
  guardian_id: number

}

type PatientMappingInfo = {
  name: string
  id: number
  age: number
  guardian_name: string
  latest_record_date: string
  record_count: number
  latest_severity: number
}
const urgencyColors: { [key: number]: string } = {
  2: "from-red-400 to-red-500",
  1: "from-yellow-400 to-yellow-500",
  0: "from-green-400 to-green-500"
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { isLoggedIn } = useAuthContext()
  const router = useRouter()
  const [patientMappingInfo, setPatientMappingInfo] = useState<PatientMappingInfo[]>([])

  const fetchPatientMappingInfo = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/patients/getPatientMappingInfoAll`)
      setPatientMappingInfo(res.data)
    } catch (error) {
      console.error("환자 매핑 정보 조회 실패:", error)
      toast({
        title: "데이터 조회 실패",
        description: "서버에서 환자 매핑 정보를 가져오지 못했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (!isLoggedIn) return
    fetchPatientMappingInfo()
  }, [isLoggedIn, toast])

  const filteredPatients = patients.filter((patient) => {
    const name = patient.name?.toLowerCase() || ""
    const guardian = patient.guardian_id?.toString()
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) || guardian.includes(searchTerm)

    return matchesSearch // 확장 가능: 날짜/리포트 필터 등
  })

  if (!isLoggedIn) {
    return <p className="text-center text-red-500 font-semibold">로그인이 필요합니다.</p>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">환자 관리</h1>
            <p className="text-gray-600 dark:text-gray-400">우리의 소중한 환자들 👨‍👩‍👧‍👦</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg" asChild>
            <Link href="/patients/register">
              <Plus className="h-4 w-4 mr-2" />새 환자 등록
            </Link>
          </Button>
        </div>

        {/* 검색 */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" /> 환자 검색
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="환자명 또는 보호자명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800"
              />
            </div>
          </CardContent>
        </Card>

        {/* 환자 카드 */}
        {loading ? (
          <p className="text-center">불러오는 중...</p>
        ) : patientMappingInfo.length === 0 ? (
          <p className="text-center text-muted-foreground">등록된 환자가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patientMappingInfo.map((patient) => (
              <Card
                key={patient.id}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white dark:bg-gray-800"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${
                          urgencyColors[patient.latest_severity || 0]
                        } rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <span className="text-white font-bold text-lg">{patient.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {patient.name}
                        <Badge variant="outline" className="text-xs">
                          {patient.age}
                        </Badge>
                      </CardTitle>
                      {patient.guardian_name && (
                        <CardDescription className="flex items-center gap-1">
                          보호자: {patient.guardian_name}
                        </CardDescription>
                      )}
                    <div className="flex gap-2 mt-2">
                      <div className="ml-auto">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            if (confirm(`정말로 ${patient.name} 환자를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 관련된 모든 증상 기록도 함께 삭제됩니다.`)) {
                              // 삭제 API 호출
                              fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients/${patient.id}`, {
                                method: 'DELETE',
                              })
                              .then(response => {
                                if (response.ok) {
                                  // 성공적으로 삭제되면 페이지 새로고침
                                  window.location.reload();
                                } else {
                                  alert('삭제 중 오류가 발생했습니다.');
                                }
                              })
                              .catch(error => {
                                console.error('Error:', error);
                                alert('삭제 중 오류가 발생했습니다.');
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> 
                          삭제
                        </Button>
                      </div>
                    </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
                    <div className="flex gap-4">
                      {patient.record_count !== undefined && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span>증상 {patient.record_count}건</span>
                        </div>
                      )}
                    </div>
                    {patient.latest_severity !== undefined && (
                      <Badge
                        className={`${
                          patient.latest_severity === 2
                            ? "bg-red-500 hover:bg-red-600"
                            : patient.latest_severity === 1
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-green-500 hover:bg-green-600"
                        } text-white`}
                      >
                        응급도 {patient.latest_severity}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/patients/${patient.id}/symptoms`}>
                        <Eye className="h-4 w-4 mr-1" />
                        증상 보기
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
