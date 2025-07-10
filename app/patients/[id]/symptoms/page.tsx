"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, Eye } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState  } from "react"
import axios from "axios"

type PatientSymptoms = {
  name: string
  age: number
  guardian: string
  symptoms: Recode[]
}

type Recode = {
  id: number
  date: string
  time: string
  symptoms: string
  urgency: number
}


const urgencyColors = {
  2: "bg-red-100 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-200",
  1: "bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-200",
  0: "bg-green-100 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-200",
}

export default function PatientSymptomsPage() {
  const params = useParams()
  const patientId = Number.parseInt(params.id as string)
  const [patient, setPatient] = useState<PatientSymptoms | null>(null)
  const fetchPatientSymptoms = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/patients/getPatientSymptoms/${patientId}`)
    setPatient(response.data)
  }
  useEffect(() => {
    fetchPatientSymptoms()
  }, [])
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
          <h1 className="text-3xl font-bold tracking-tight">{patient.name}의 증상 기록</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {patient.age}세 | 보호자: {patient.guardian}
          </p>
        </div>
      </div>

      {/* 증상 목록 */}
      <div className="space-y-4">
        {patient.symptoms.map((symptom) => (
          <Card key={symptom.id} className="shadow-lg border-0">
            <CardContent className="p-6">
              <div
                className={`p-4 rounded-xl border-2 ${urgencyColors[symptom.urgency as keyof typeof urgencyColors]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          symptom.urgency === 2
                            ? "bg-red-500 text-white"
                            : symptom.urgency === 1
                              ? "bg-yellow-500 text-white"
                              : "bg-green-500 text-white"
                        }`}
                      >
                        응급도 {symptom.urgency}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{symptom.symptoms}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {symptom.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {symptom.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/summary/${symptom.id}?patient_name=${patient.name}&guardian_name=${patient.guardian}&patient_id=${patientId}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        상세 보기
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {patient.symptoms.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">등록된 증상이 없습니다</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">새로운 증상을 등록해보세요</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
