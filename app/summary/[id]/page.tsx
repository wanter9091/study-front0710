"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Edit, Save, X, FileText, Mic, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import Image from "next/image"
import { useSearchParams } from "next/navigation" 
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import "./NotoSansKR-normal"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"



// 모의 데이터
const summaryData = {
  id: 1,
  patientName: "김민수",
  guardian: "김영희",
  date: "2024-01-15",
  originalAudio: "recording_20240115_001.mp3",
  sttResult: `환자가 3일 전부터 발열 증상을 보이고 있습니다. 체온이 38.5도까지 올라갔으며, 기침과 콧물도 함께 나타나고 있습니다. 식욕이 떨어져서 평소보다 적게 먹고 있고, 밤에 잠을 잘 못 자고 있습니다. 목이 아프다고 계속 호소하고 있어서 걱정이 됩니다. 열이 내려갔다가 다시 올라가는 패턴을 보이고 있어서 해열제를 주기적으로 먹이고 있습니다.`,
  aiSummary: `【주요 증상】
• 발열 (38.5°C, 3일간 지속)
• 기침 및 콧물
• 인후통
• 식욕부진
• 수면장애

【진료 소견】
상기도 감염 의심 증상으로 보임. 발열이 3일간 지속되고 있어 세심한 관찰 필요.

【권장사항】
• 충분한 수분 섭취
• 해열제 복용 (필요시)
• 증상 악화 시 재내원
• 고열 지속 시 응급실 방문 고려`,
}

type SummaryData = {
  id: number
  patientName: string
  guardian: string
  date: string
  originalAudio: string
  sttResult: string
  aiSummary: string
}

type Patient = {
  id: number
  name: string
  guardian_id: number
  birthdate: string
  gender: string
  age: number
}

type Recode = {
  id: number
  guardian_id: number
  severity: number
  image_url: string
  temperature: number
  summary: string
  record_time: string
}

export default function SummaryDetailPage({ 
  params,
  //searchParams,
}: { 
  params: { id: string } 
  //searchParams: { patient_name: string, guardian_name: string}
}) {
  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [record, setRecord] = useState<Recode | null>(null) // 현재 증상기록
  
  // 수정 모드 체온/심각도/증상
  const [summary, setSummary] = useState("")
  const [temperature, setTemperature] = useState(0)
  const [severity, setSeverity] = useState(0)

  const [patient, setPatient] = useState<Patient | null>(null)
  const [finalSummary, setFinalSummary] = useState<string | null>(null)
  const [isGeneratingFinalSummary, setIsGeneratingFinalSummary] = useState(false)
  const [isEditingFinalSummary, setIsEditingFinalSummary] = useState(false)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // pdf 사진 저장용
  const photoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchRecord = async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/recode/getRecord/${params.id}`)
      setRecord(response.data)
      setSummary(response.data.summary)
      setTemperature(response.data.temperature)
      setSeverity(response.data.severity) 
    }
    const fetchPatient = async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/patients/getPatient2/${searchParams.get("patient_id")}`)
      setPatient(response.data)
    }
    fetchPatient()
    fetchRecord()
  }, [])

  const finalSummaryFunc = async () => {
    setIsGeneratingFinalSummary(true)
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/ai/final_summary`, {
      patient_name: patient?.name,
      patient_gender: patient?.gender,
      patient_age: patient?.age,
      guardian_name: searchParams.get("guardian_name"),
      summary: summary,
      record_time: record?.record_time,
      severity: record?.severity,
      temperature: record?.temperature
    })
    console.log(response.data)
    setFinalSummary(response.data)
    setIsGeneratingFinalSummary(false)
  }
  const handleUpdateRecord = async () => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/recode/${params.id}`, {
        summary: summary,
        temperature: temperature,
        severity: severity
      })
      
      toast({
        title: "수정 완료",
        description: "증상 기록이 성공적으로 수정되었습니다.",
      })
      
      setIsEditingSummary(false)
      
      // 수정된 데이터로 record 상태 업데이트
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/recode/getRecord/${params.id}`)
      setRecord(response.data)
      
    } catch (error) {
      toast({
        title: "수정 실패",
        description: "증상 기록 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }
  

  const downloadReport = (format: "txt" | "pdf") => {
    const patientName = searchParams.get("patient_name") ?? ""
    const guardianName = searchParams.get("guardian_name") ?? ""
    const recordDate = record?.record_time.substring(0, 10) + " " + record?.record_time.substring(11, 16)
    const createdAt = new Date().toLocaleString("ko-KR")
  
    if (format === "txt") {
      const content = `증상 기록 리포트
환자명: ${patientName}
보호자: ${guardianName}
기록일: ${recordDate}
생성일: ${createdAt}

=== AI 요약 ===
${record?.summary}`
  
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `증상 요약_${patientName}_${recordDate}.txt`
      a.click()
      URL.revokeObjectURL(url)
  
      toast({
        title: `${format.toUpperCase()} 다운로드 완료`,
        description: "리포트가 다운로드되었습니다.",
      })
    }
  
    if (format === "pdf") {
      const doc = new jsPDF()
      doc.setFont("NotoSansKR", "normal")
      doc.setFontSize(12)
    
      const summaryLines = (finalSummary ?? "").split("\n");

      const lines = [
        `증상 기록 리포트`,
        `환자명: ${patientName}`,
        `보호자: ${guardianName}`,
        `기록일: ${recordDate}`,
        `생성일: ${createdAt}`,
        "",
        `=== AI 요약 ===`,
        ...summaryLines, // ← 이렇게 하면 요약 전체가 줄바꿈 유지된 상태로 출력됨
      ];
    
      lines.forEach((line, index) => {
        doc.text(line, 10, 10 + index * 10)
      })
    
      const yOffset = 10 + lines.length * 10
    
      if (photoRef.current) {
        html2canvas(photoRef.current).then((canvas) => {
          const imgData = canvas.toDataURL("image/png")
          doc.addImage(imgData, "PNG", 10, yOffset, 180, 120) // 폭: 180mm로 꽉 차게
          doc.save(`증상 요약_${patientName}_${recordDate}.pdf`)
    
          toast({
            title: "PDF 다운로드 완료",
            description: "사진이 포함된 리포트가 저장되었습니다.",
          })
        }).catch((error) => {
          console.error("캡처 실패", error)
          doc.save(`증상 요약_${patientName}_${recordDate}.pdf`)
        })
      } else {
        doc.save(`증상 요약_${patientName}_${recordDate}.pdf`)
      }
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">증상 요약 상세</h1>
          <p className="text-muted-foreground">
            {searchParams.get("patient_name")} • {record?.record_time.substring(0, 10)+" "+record?.record_time.substring(11, 16)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            onClick={() => {
              if (confirm(`정말로 이 증상 기록을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
                // 삭제 API 호출
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/recode/${params.id}`, {
                  method: 'DELETE',
                })
                .then(response => {
                  if (response.ok) {
                    toast({
                      title: "삭제 완료",
                      description: "증상 기록이 삭제되었습니다.",
                    })
                    // 페이지 이동
                    window.location.href = "/patients"
                  } else {
                    toast({
                      title: "삭제 실패",
                      description: "삭제 중 오류가 발생했습니다.",
                      variant: "destructive",
                    })
                  }
                })
                .catch(error => {
                  console.error('Error:', error)
                  toast({
                    title: "삭제 실패",
                    description: "삭제 중 오류가 발생했습니다.",
                    variant: "destructive",
                  })
                })
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </Button>
          <Button variant="outline" onClick={() => downloadReport("txt")}>
            <Download className="h-4 w-4 mr-2" />
            TXT 다운로드
          </Button>
          <Button onClick={() => downloadReport("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            PDF 다운로드
          </Button>
        </div>
      </div>

      {/* 환자 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>환자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">환자명</p>
              <p className="font-medium">{searchParams.get("patient_name")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">보호자</p>
              <p className="font-medium">{searchParams.get("guardian_name")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">기록일</p>
              <p className="font-medium">{record?.record_time.substring(0, 10)+" "+record?.record_time.substring(11, 16)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 사진 */}
        <Card>
          <CardHeader>
            <CardTitle>사진</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={photoRef}>
              {record?.image_url ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${record.image_url}`}
                  alt="사진"
                  width={500}
                  height={500}
                  unoptimized
                />
              ) : (
                <div className="text-center text-muted-foreground py-12">사진 없음</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI 요약 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <div>
                  <CardTitle>증상 요약</CardTitle>
                  {/* <CardDescription>AI가 생성한 구조화된 요약</CardDescription> */}
                </div>
              </div>
              <div className="flex gap-2">
                {isEditingSummary ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleUpdateRecord()}>
                      <X className="h-4 w-4 mr-1" />
                      수정 모드 종료
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingSummary(true)}>
                    <Edit className="h-4 w-4 mr-1" />
                    체온/심각도/증상 수정
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-muted-foreground">체온</div>
                {isEditingSummary ? (
                  <Input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                    className="text-lg font-semibold text-blue-700 dark:text-blue-300 border-0 bg-transparent p-0 h-auto"
                  />
                ) : (
                  <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                    {temperature}°C
                  </div>
                )}
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-sm text-muted-foreground">심각도</div>
                {isEditingSummary ? (
                  <Select value={severity.toString()} onValueChange={(value) => setSeverity(parseInt(value))}>
                    <SelectTrigger className="text-lg font-semibold text-orange-700 dark:text-orange-300 border-0 bg-transparent p-0 h-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">낮음</SelectItem>
                      <SelectItem value="1">중간</SelectItem>
                      <SelectItem value="2">높음</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                    {severity === 0 ? "낮음" : severity === 1 ? "중간" : "높음"}
                  </div>
                )}
              </div>
            </div>
            {isEditingSummary ? (
              <Textarea
                value={summary}
                rows={10}
                className="resize-none"
                onChange={(e) => setSummary(e.target.value)}
              />
            ) : (
              <div className="p-4 bg-muted rounded-lg">
                <pre className="whitespace-pre-wrap font-sans" >{summary}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 최종 요약 */}
      <Card>
        <CardHeader>
          <CardTitle>최종 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            {isEditingFinalSummary ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditingFinalSummary(false)}>
                  <X className="h-4 w-4 mr-1" />
                  임시 수정 모드 종료
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditingFinalSummary(true)}>
                <Edit className="h-4 w-4 mr-1" />
                임시 수정 모드
              </Button>
            )}
          </div>
        </CardContent>
        <CardContent>
          {isEditingFinalSummary ? (
            <Textarea
              value={finalSummary ?? ""}
              rows={12}
              className="resize-none"
              onChange={(e) => setFinalSummary(e.target.value)}
            />
          ) : (
            <div className="p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap font-sans">{finalSummary}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={finalSummaryFunc}
            disabled={isGeneratingFinalSummary}
          >
            <FileText className="h-4 w-4 mr-2" />
            {isGeneratingFinalSummary ? "생성 중..." : "새 요약 생성"}
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>시연용 여백</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg">
            <pre className="whitespace-pre-wrap font-sans">{finalSummary}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
