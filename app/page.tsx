"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download, Clock, Droplets, Sun, Baby } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import axios from "axios"

// 모의 데이터
const recentSummaries = [
  {
    id: 1,
    patientName: "김민수",
    guardian: "김영희",
    symptoms: "발열, 기침, 콧물 증상으로 내원. 체온 38.5도",
    date: "2024-01-15",
    urgency: 2,
    time: "14:30",
  },
  {
    id: 2,
    patientName: "이서연",
    guardian: "이정호",
    symptoms: "복통 및 설사 증상. 식욕부진 동반",
    date: "2024-01-15",
    urgency: 1,
    time: "13:45",
  },
  {
    id: 3,
    patientName: "박준호",
    guardian: "박미영",
    symptoms: "두통과 어지러움 호소. 수면 부족으로 추정",
    date: "2024-01-14",
    urgency: 3,
    time: "16:20",
  },
]

type RecentSummary = {
  id: number
  patientName: string
  patient_id: number
  guardian: string
  symptoms: string
  date: string
  urgency: number
  time: string
}

const urgencyColors = {
  2: "bg-red-100 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-200",
  1: "bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-200",
  0: "bg-green-100 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-200",
}

const todayStats = [
  { label: "새 증상 등록", count: 12, color: "bg-green-500" },
  { label: "응급 케이스", count: 3, color: "bg-red-500" },
  { label: "검토 대기", count: 5, color: "bg-yellow-500" },
]

export default function Dashboard() {
  const [recentSummaries, setRecentSummaries] = useState<RecentSummary[]>([])
  useEffect(() => {
    const fetchRecentSummaries = async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/p_r_mapping/recent_records`)
      setRecentSummaries(response.data)
    }
    fetchRecentSummaries()
  }, [])

  return (
    <div className="flex-1 space-y-8 p-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            소아과 AI 대시보드
          </h1>
          <p className="text-gray-600 dark:text-gray-400">오늘도 건강한 하루 되세요 👶</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString("ko-KR")}</span>
        </div>
      </div>

      {/* 메인 콘텐츠 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 최근 진료 요약 - 2/3 너비 */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">최근 진료 요약</CardTitle>
                  <CardDescription>최근 등록된 환자 증상 요약 목록</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/calendar">전체 보기</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSummaries.map((summary: RecentSummary) => (
                  <div
                    key={summary.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${urgencyColors[summary.urgency as keyof typeof urgencyColors]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-lg">{summary.patientName}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">(보호자: {summary.guardian})</span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              summary.urgency === 2
                                ? "bg-red-500 text-white"
                                : summary.urgency === 1
                                  ? "bg-yellow-500 text-white"
                                  : "bg-green-500 text-white"
                            }`}
                          >
                            응급도 {summary.urgency}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{summary.symptoms}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">📅 {summary.date}</span>
                          <span className="flex items-center gap-1">🕐 {summary.time}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/summary/${summary.id}?patient_name=${summary.patientName}&guardian_name=${summary.guardian}&patient_id=${summary.patient_id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            보기
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 - 1/3 너비 */}
        <div className="space-y-6">
          {/* 알아두면 좋은 소아 질병 정보 */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  🏥 알아두면 좋은 소아 질병 정보
                </CardTitle>
                <Badge variant="outline">우리 아이가 자주 걸리는 질병들을 미리 알아보세요</Badge>
              </div>
              {/*
              <Button variant="outline" size="sm" asChild>
                <Link href="/disease-info">더 보기</Link>
              </Button>
              */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🤧</span>
                  <h3 className="font-semibold">감기 | 겨울철 주의</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">콧물, 기침, 발열이 주요 증상</p>
                <div className="flex gap-2 text-xs">
                  <Badge variant="secondary">콧물</Badge>
                  <Badge variant="secondary">기침</Badge>
                  <Badge variant="secondary">발열</Badge>
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🤢</span>
                  <h3 className="font-semibold">장염 | 여름철 주의</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">설사, 복통, 구토가 주요 증상</p>
                <div className="flex gap-2 text-xs">
                  <Badge variant="secondary">설사</Badge>
                  <Badge variant="secondary">복통</Badge>
                  <Badge variant="secondary">구토</Badge>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🤒</span>
                  <h3 className="font-semibold">수족구병 | 봄·여름철 주의</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">발열, 입안 수포, 손발 발진이 주요 증상</p>
                <div className="flex gap-2 text-xs">
                  <Badge variant="secondary">발열</Badge>
                  <Badge variant="secondary">입안 수포</Badge>
                  <Badge variant="secondary">손발 발진</Badge>
                </div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🤧</span>
                  <h3 className="font-semibold">알레르기 비염 | 환절기 주의</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">재채기, 맑은 콧물, 코막힘이 주요 증상</p>
                <div className="flex gap-2 text-xs">
                  <Badge variant="secondary">재채기</Badge>
                  <Badge variant="secondary">맑은 콧물</Badge>
                  <Badge variant="secondary">코막힘</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* 건강 정보 섹션 */}
      <div className="space-y-6">
        {/* 오늘의 건강 팁 */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              💡 오늘의 건강 팁<Badge variant="secondary">우리 아이 건강을 위한 작은 습관들</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-700 dark:text-blue-300">충분한 수분</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">하루 6-8잔의 물을 마셔요</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <Sun className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">햇볕 쬐기</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">비타민 D 합성을 위해</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <Baby className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-700 dark:text-purple-300">충분한 수면</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">성장호르몬 분비 시간</p>
              </div>
            </div>
          </CardContent>
        </Card>

        

        {/* 연령별 영양 가이드 */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  🍎 연령별 영양 가이드
                  <Badge variant="outline">우리 아이 나이에 맞는 올바른 영양 정보를 확인하세요</Badge>
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👶</span>
                  <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">0-2세 (영아기)</h3>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 모유/분유가 주식</li>
                  <li>• 6개월부터 이유식 시작</li>
                  <li>• 수유 간격 2-3시간</li>
                  <li>• 비타민 D 보충 고려</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🧒</span>
                  <h3 className="font-semibold text-green-700 dark:text-green-300">3-6세 (유아기)</h3>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 다양한 식품군 섭취</li>
                  <li>• 단백질 충분히 섭취</li>
                  <li>• 칼슘이 풍부한 음식</li>
                  <li>• 손 씻기 습관 형성</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👦</span>
                  <h3 className="font-semibold text-purple-700 dark:text-purple-300">7-12세 (학령기)</h3>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 성장에 필요한 영양소</li>
                  <li>• 규칙적인 식사 시간</li>
                  <li>• 비타민과 무기질 보충</li>
                  <li>• 적절한 운동과 휴식</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 응급상황 시 대처법 */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  🚨 응급상황 시 대처법
                  <Badge variant="destructive">
                    이런 응급상황 시 올바른 조치를 위해서는 바로 소아과 전문의의 진료를 받으시기 바랍니다.
                  </Badge>
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🌡️</span>
                  <h3 className="font-semibold text-red-700 dark:text-red-300">고열 (39도 이상)</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  체온이 39도 이상이거나 해열제로도 내려가지 않을 때
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-orange-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🫁</span>
                  <h3 className="font-semibold text-orange-700 dark:text-orange-300">호흡곤란</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">숨쉬기 어려워하거나 입술이 파래질 때</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">😵</span>
                  <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">의식 잃음</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">의식을 잃거나 반응이 없을 때</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
