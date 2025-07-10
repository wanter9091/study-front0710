"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Eye, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";
import axios from "axios";

interface SymptomItem {
  id: number;
  patient: string;
  symptoms: string;
  hasReport: boolean;
  urgency: 1 | 2 | 3;
  details: string;
  date: string;
}

const urgencyColors: Record<1 | 2 | 3, { bg: string; border: string; text: string; badge: string }> = {
  2: { bg: "bg-red-100 dark:bg-red-950/30", border: "border-red-300 dark:border-red-700", text: "text-red-800 dark:text-red-200", badge: "bg-red-500" },
  1: { bg: "bg-yellow-100 dark:bg-yellow-950/30", border: "border-yellow-300 dark:border-yellow-700", text: "text-yellow-800 dark:text-yellow-200", badge: "bg-yellow-500" },
  3: { bg: "bg-green-100 dark:bg-green-950/30", border: "border-green-300 dark:border-green-700", text: "text-green-800 dark:text-green-200", badge: "bg-green-500" },
};

const urgencyLabels = {
  2: { label: "응급", description: "즉시 응급실", color: "text-red-600" },
  1: { label: "경증", description: "관찰 필요", color: "text-yellow-600" },
  3: { label: "경미", description: "일반 진료", color: "text-green-600" },
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [symptomData, setSymptomData] = useState<Record<string, SymptomItem[]>>({});

  // ✅ 백엔드 연동
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/calendar/events`)
      .then(res => {
        console.log("📦 받아온 데이터:", res.data);  // ✅ 무조건 출력해
        const grouped: Record<string, SymptomItem[]> = {};
        res.data.forEach((item: SymptomItem) => {
          if (!item.date) {
            console.warn("❗ date가 없음:", item);
            return;
          }
          if (!grouped[item.date]) grouped[item.date] = [];
          grouped[item.date].push(item);
        });
        console.log("📅 그룹핑된 데이터:", grouped);
        setSymptomData(grouped);
      })
      .catch(err => console.error("❌ 캘린더 이벤트 로드 실패", err));
  }, []);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const formatDate = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const hasSymptoms = (dateStr: string) => symptomData[dateStr]?.length > 0;
  const getSymptomCount = (dateStr: string) => symptomData[dateStr]?.length || 0;
  const getHighestUrgency = (dateStr: string) => {
    const symptoms = symptomData[dateStr];
    if (!symptoms) return null;
    return Math.min(...symptoms.map((s) => s.urgency));
  };

  const handleDateClick = (day: number) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (hasSymptoms(dateStr)) {
      setSelectedDate(dateStr);
      setIsDialogOpen(true);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);
  const selectedSymptoms = selectedDate ? symptomData[selectedDate] || [] : [];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 상단 헤더 */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">증상 달력</h1>
        <p className="text-muted-foreground">날짜별 증상 등록 현황을 확인하세요</p>
      </div>

      {/* 본문: 달력 + 사이드 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 달력 카드 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</CardTitle>
                  <CardDescription>날짜를 클릭하여 해당일의 증상 기록을 확인하세요</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}> <ChevronLeft className="h-4 w-4" /> </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}> <ChevronRight className="h-4 w-4" /> </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 요일 표시 */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <div key={day} className="p-3 text-center font-medium text-muted-foreground">{day}</div>
                ))}
              </div>

              {/* 날짜 셀 */}
              <div className="grid grid-cols-7 gap-2">
                {emptyDays.map((day) => (
                  <div key={`empty-${day}`} className="p-2 h-24" />
                ))}

                {days.map((day) => {
                  const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const hasData = hasSymptoms(dateStr);
                  const count = getSymptomCount(dateStr);
                  const highestUrgency = getHighestUrgency(dateStr);

                  return (
                    <div
                      key={day}
                      className={`p-3 h-24 border rounded-xl cursor-pointer relative transition-all group ${hasData && highestUrgency ? `${urgencyColors[highestUrgency].bg} ${urgencyColors[highestUrgency].border} hover:shadow-lg hover:-translate-y-1` : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                      onClick={() => handleDateClick(day)}
                    >
                      <div className="text-sm font-semibold">{day}</div>
                      {hasData && highestUrgency && (
                        <>
                          <div className="absolute top-2 right-2">
                            <div className={`w-3 h-3 ${urgencyColors[highestUrgency].badge} rounded-full animate-pulse`} />
                          </div>
                          <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
                            <Badge variant="secondary" className={`text-xs px-1 py-0 ${urgencyColors[highestUrgency].badge} text-white border-0 shadow-sm`}>
                              {urgencyLabels[highestUrgency].label}
                            </Badge>
                            <span className="text-xs font-medium">{count}건</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 우측 날짜 정보 & 범례 */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">날짜 정보</CardTitle>
              <CardDescription>날짜를 선택하세요</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-3">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <div className="text-lg font-semibold">{new Date(selectedDate).toLocaleDateString("ko-KR")}</div>
                    <div className="text-sm text-muted-foreground">선택된 날짜</div>
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between items-center">
                      <span>등록된 케이스</span>
                      <Badge variant="secondary">{getSymptomCount(selectedDate)}건</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-sm">날짜를 클릭해주세요</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 다이얼로그: 증상 상세 목록 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>📅 {selectedDate && new Date(selectedDate).toLocaleDateString("ko-KR")} 증상 기록</DialogTitle>
            <DialogDescription>해당 날짜에 등록된 환자 증상 목록입니다.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedSymptoms.map((symptom) => (
              <div key={symptom.id} className={`p-4 border rounded-lg ${urgencyColors[symptom.urgency].bg} ${urgencyColors[symptom.urgency].border}`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{symptom.patient}</span>
                      <Badge className={`${urgencyColors[symptom.urgency].badge} text-white`}>응급도 {symptom.urgency}</Badge>
                      <Badge variant={symptom.hasReport ? "default" : "secondary"}>{symptom.hasReport ? "리포트 완료" : "요약만"}</Badge>
                    </div>
                    <p className="text-sm font-medium">{symptom.symptoms}</p>
                    <p className="text-sm text-muted-foreground">{symptom.details}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/summary/${symptom.id}?patient_name=${encodeURIComponent(symptom.patient)}&guardian_name=보호자1`}/>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/summary/${symptom.id}`}><Eye className="h-4 w-4 mr-1" /> 보기</Link>
                    </Button>
                    {symptom.hasReport && (
                      <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" /> 리포트</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
