"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, Download, Eye } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// 모의 리포트 데이터
const patientReports = {
  1: {
    name: "김민수",
    age: 7,
    guardian: "김영희",
    reports: [
      {
        id: 1,
        date: "2024-01-15",
        time: "14:30",
        title: "상기도 감염 진료 리포트",
        diagnosis: "급성 상기도 감염",
        symptoms: "발열, 기침, 콧물",
        treatment: "해열제 처방, 충분한 휴식 권장",
        followUp: "3일 후 재방문 필요시",
        doctor: "김소아 의사",
      },
      {
        id: 2,
        date: "2024-01-10",
        time: "10:15",
        title: "급성 편도염 진료 리포트",
        diagnosis: "급성 편도염",
        symptoms: "인후통, 연하곤란, 편도선 부종",
        treatment: "항생제 처방, 가글 권장",
        followUp: "1주일 후 재방문",
        doctor: "김소아 의사",
      },
    ],
  },
}

export default function PatientReportsPage() {
  const params = useParams()
  const patientId = Number.parseInt(params.id as string)
  const patient = patientReports[patientId as keyof typeof patientReports]

  if (!patient) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">환자를 찾을 수 없습니다</h1>
          <Button asChild className="mt-4">
            <Link href="/patients">환자 목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/patients">
            <ArrowLeft className="h-4 w-4 mr-2" />
            환자 목록
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{patient.name}의 진료 리포트</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {patient.age}세 | 보호자: {patient.guardian}
          </p>
        </div>
      </div>

      {/* 리포트 목록 */}
      <div className="space-y-6">
        {patient.reports.map((report) => (
          <Card key={report.id} className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{report.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {report.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {report.time}
                    </span>
                    <Badge variant="outline">담당의: {report.doctor}</Badge>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    상세 보기
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    다운로드
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">진단명</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{report.diagnosis}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">주요 증상</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{report.symptoms}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">치료 방법</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{report.treatment}</p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <h3 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">추후 관리</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{report.followUp}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {patient.reports.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">생성된 리포트가 없습니다</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">진료 후 리포트가 자동으로 생성됩니다</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
