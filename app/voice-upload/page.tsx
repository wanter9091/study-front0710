"use client"

import { useState, useRef, useEffect } from "react"

import { Edit, ArrowLeft } from "lucide-react"
import { Patient } from "@/data/patient"
import { addNewPatient } from "@/lib/dummy-data"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NewPatientData {
  name: string
  age: string
  guardian: string
  phone: string
  address: string
}

interface SymptomRecord {
  id: string
  childName: string
  symptoms: string
  timestamp: string
  date: string
  time: string
  isCompleted: boolean
}

export default function SymptomInputPage() {
  // 토스트 메시지
  const { toast } = useToast()
  // 아이용 UI 상태
  const [currentStep, setCurrentStep] = useState<"name" | "symptoms" | "completed">("name")
  const [childName, setChildName] = useState("")
  const [childSymptoms, setChildSymptoms] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // 기록 관리
  const [savedRecords, setSavedRecords] = useState<SymptomRecord[]>([])
  const [showAdultMode, setShowAdultMode] = useState(false)
  const [editingRecord, setEditingRecord] = useState<SymptomRecord | null>(null)

  // 어른용 수정 상태
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null) // 선택된 환자의 id 저장 
  const [summaryText, setSummaryText] = useState("")
  const [severity, setSeverity] = useState<number>(0)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [temperature, setTemperature] = useState<number | null>(null) // 체온
  const [image, setImage] = useState<File | null>(null) // 사진 


  // 새 환자 추가 상태
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [formData, setFormData] = useState({// 새환자 추가 폼
    name: "",
    birthdate: "",
    gender: "",
    blood_type: "",
    memo: "",
  })
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
  const { guardian } = useAuth()
  
  // 음성인식 관리
  const [inputValue, setInputValue] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  

  // 환자 목록 셀렉터 가져오기
  const getPatients = async () => {
    const res = await axios.get('http://localhost:8000/patients/getPatientsSelect')
    setPatients(res.data)
  }
  useEffect(() => {
    getPatients()
  }, [])

  // 1단계: 이름 말하기
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    setIsRecording(true);
    setIsProcessing(true)
  
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
  
    mediaRecorderRef.current = mediaRecorder;
  
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob, 'voice.webm');
  
      try {
        const res = await fetch('http://localhost:8000/whisper/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        setChildName(data.text); 
      } catch (error) {
        console.error('전송 오류:', error);
      } finally {
        // 스트림 정리
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        setIsRecording(false);
      }
    };
  
    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();

      setTimeout(() => {
        setIsRecording(false);
        setIsProcessing(false);
        setCurrentStep("symptoms")
      }, 2000)
    }, 3000); // 5초 후 stop

    
  };
  

  // 2단계: 증상 말하기
  const startSymptomsRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    setIsRecording(true);
    setIsProcessing(true)

    const recordOnce = () => {
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'voice.webm');

        try {
          const res = await fetch('http://localhost:8000/whisper/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          setChildSymptoms((prev) => prev + ' ' + data.text); // 결과 누적
        } catch (error) {
          console.error('전송 오류:', error);
        }
      };

      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 3000); // 3초 후 stop
    };

    // 3초마다 반복 실행
    recordOnce(); // 첫 실행
    intervalRef.current = setInterval(recordOnce, 3000);
  };

  const stopSymptomsRecording = () => {
    setIsRecording(false);
    setIsProcessing(false);
    setCurrentStep("completed")
    const now = new Date()
      const newRecord: SymptomRecord = {
        id: Date.now().toString(),
        childName: childName,
        symptoms: childSymptoms,
        timestamp: now.toISOString(),
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().split(" ")[0].substring(0, 5),
        isCompleted: false,
      }
      setSavedRecords((prev) => [...prev, newRecord])
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop(); // 마지막 클립 마무리
    }
  };

  // 다시 시작하기
  const resetToStart = () => {
    setCurrentStep("name")
    setChildName("")
    setChildSymptoms("")
    setIsRecording(false)
    setIsProcessing(false)
  }

  // 어른 모드로 전환
  const switchToAdultMode = (record?: SymptomRecord) => {
    setShowAdultMode(true)
    if (record) {
      setEditingRecord(record)
      setSummaryText("")
      setSelectedPatient(null)
      setSeverity(0)
      setImage(null)
      // 환자 이름으로 자동 매칭 시도
      const matchedPatient = patients.find((p) => p.name === record.childName)
      if (matchedPatient) {
        setSelectedPatient(Number(matchedPatient.id))
      }
    }
  }

  // AI 요약 생성
  const generateSummary = async () => {
    if (!editingRecord) return

    setIsGeneratingSummary(true)
    setTimeout(async () => {
      const response = await axios.post('http://localhost:8000/ai/summary', {
        content: editingRecord?.symptoms ?? "",
      })
      setSummaryText(response.data)
      setIsGeneratingSummary(false)
    }, 2000)
  }

    // 증상 기록 생성
    const completeRecord = async () => {
      if (!editingRecord || !selectedPatient) {
        alert("환자를 선택해주세요!")
        return
      }
      setIsSaving(true)


      const formData = new FormData();
  
      formData.append('summary', summaryText);
      formData.append('severity', severity.toString());
      formData.append('guardian_id', "1");
      formData.append('patient_id', selectedPatient.toString());
      if(image) formData.append('image', image);
      if(temperature !== null) formData.append('temperature', temperature.toString());
      for(const [key, value] of formData.entries()) {
        console.log(key, value)
      }
      
      try{
        const res = await axios.post('http://localhost:8000/recode', formData,{
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        
        if(res.status === 200) {
          toast({
            title: "기록이 생성되었습니다!",
            description: "기록이 생성되었습니다!",
            variant: "default",
          })
          alert("기록이 완료되었습니다!")
        }
      } catch (error) {
        console.error('기록 생성 오류:', error);
      }
      setTimeout(() => {
        setSavedRecords((prev) =>
          prev.map((record) => (record.id === editingRecord.id ? { ...record, isCompleted: true } : record)),
        )

        setIsSaving(false)
        setShowAdultMode(false)
        setEditingRecord(null)
      }, 1000)
    }


  // 새 환자 추가
  const handleAddNewPatient = async () => {
    if (!formData.name.trim() || !formData.birthdate.trim() || !guardian) {
      alert("필수 정보를 모두 입력해주세요!")
      return
    }

    const age = calculateAge(formData.birthdate)
    if (isNaN(Number(age)) || Number(age) < 0 || Number(age) > 18) {
      alert("올바른 나이를 입력해주세요! (0-18세)")
      return
    }

    try{
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/patients/`, {
        ...formData,
        guardian_id: guardian?.id,
      })
      getPatients()
      setShowAddPatientModal(false)
      setFormData({ name: "", birthdate: "", gender: "", blood_type: "", memo: "" })
      alert(`${formData.name} 환자가 등록되었습니다!`)
      toast({
        title: "등록 성공 🎉",
        description: "환자 정보가 등록되었습니다.",
      })
    } catch (error) {
      toast({
        title: "등록 실패",
        description: "서버 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
    
  }

  // 어른 모드 UI
  if (showAdultMode) {
    return (
      <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAdultMode(false)}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">기록 수정 및 완료</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">아이의 기록을 검토하고 완료해주세요</p>
          </div>
        </div>

        {editingRecord && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 아이가 말한 내용 */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">아이가 말한 내용</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">이름</label>
                  <input
                    type="text"
                    value={editingRecord.childName}
                    onChange={(e) => {
                      setEditingRecord(prev => prev ? {...prev, childName: e.target.value} : null)
                    }}
                    className="text-lg font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 px-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">기록 시간</label>
                  <p className="text-gray-900 dark:text-white">
                    {editingRecord.date} {editingRecord.time}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">증상</label>
                  <textarea
                    value={editingRecord.symptoms}
                    onChange={(e) => {
                      setEditingRecord(prev => prev ? {...prev, symptoms: e.target.value} : null)
                    }}
                    className="mt-1 w-full p-3 bg-blue-50 dark:bg-blue-900 rounded-md text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={4}
                    placeholder="증상을 입력하세요..."
                  />
                </div>
                <button
                  onClick={generateSummary}
                  disabled={isGeneratingSummary}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {isGeneratingSummary ? "AI 요약 생성 중..." : "AI 요약 생성"}
                </button>
              </div>
            </div>

            {/* 의료진 입력 */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">보호자 입력</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">환자 선택</label>
                  <div className="flex space-x-2">
                    <select
                      value={selectedPatient ?? ""}
                      onChange={(e) => setSelectedPatient(Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">환자를 선택하세요</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} ({patient.age}세)
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowAddPatientModal(true)}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                    >
                      추가
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">심각도</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="0">낮음</option>
                    <option value="1">중간</option>
                    <option value="2">높음</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">체온 (℃)</label>
                  <input
                    type="number"
                    value={temperature ?? ""}
                    onChange={(e) => setTemperature(e.target.value === "" ? null : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="예: 36.5"
                    min="30"
                    max="45"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">사진 업로드</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImage(e.target.files[0]);
                      } else {
                        setImage(null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {image && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="업로드된 사진 미리보기"
                        className="max-h-32 rounded-md border border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">의료 요약</label>
                  <textarea
                    value={summaryText}
                    onChange={(e) => setSummaryText(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="AI 요약을 생성하거나 직접 입력하세요..."
                  />
                </div>

                <button
                  onClick={completeRecord}
                  disabled={isSaving || !selectedPatient}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {isSaving ? "저장 중..." : "기록 완료"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 새 환자 추가 모달 */}
        {showAddPatientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">새 환자 등록</h3>
                <button
                  onClick={() => setShowAddPatientModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    환자명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="환자 이름"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                {/* 생년월일 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    생년월일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="birthdate"
                      type="date"
                      value={formData.birthdate}
                      onChange={(e) => handleInputChange("birthdate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="생년월일"
                    />
                    {formData.birthdate && (
                    <Badge variant="secondary">
                      나이: {calculateAge(formData.birthdate)}세
                    </Badge>
                  )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      혈액형
                    </label>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">성별</label>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">메모</label>
                  <textarea
                    id="memo"
                    value={formData.memo}
                    onChange={(e) => handleInputChange("memo", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="기타 특이사항 입력"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddPatientModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAddNewPatient}
                  disabled={
                    !formData.name.trim() || !formData.birthdate.trim() || !guardian
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 아이용 단순 UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* 단계별 UI */}
        {currentStep === "name" && (
          <div className="text-center space-y-8">
            <div className="text-8xl mb-4">👋</div>
            <h1 className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-4">안녕! 이름이 뭐야?</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">버튼을 누르고 이름을 말해줘!</p>

            <button
              onClick={startRecording}
              disabled={isRecording || isProcessing}
              className={`w-64 h-64 rounded-full text-white font-bold text-3xl transition-all duration-300 ${
                isRecording || isProcessing
                  ? "bg-red-500 animate-pulse scale-110"
                  : "bg-purple-500 hover:bg-purple-600 hover:scale-105"
              }`}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-2">👂</div>
                  <div>듣고 있어요!</div>
                </div>
              ) : isRecording ? (
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-2">🎤</div>
                  <div>말해주세요!</div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-2">🎤</div>
                  <div>이름 말하기</div>
                </div>
              )}
            </button>

            {childName && (
              <div className="mt-8 p-6 bg-green-100 dark:bg-green-900 rounded-2xl">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-xl font-bold text-green-800 dark:text-green-200">안녕, {childName}! 잘했어요!</p>
              </div>
            )}
          </div>
        )}

        {currentStep === "symptoms" && (
          <div className="text-center space-y-8">
            <div className="text-8xl mb-4">🤒</div>
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              {childName} 친구, 어디가 아픈지 말해줘!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">아픈 곳을 자세히 말해주면 도와줄게!</p>

            <button
              onClick={isRecording? stopSymptomsRecording : startSymptomsRecording}
              className={`w-64 h-64 rounded-full text-white font-bold text-3xl transition-all duration-300 ${
                isRecording || isProcessing
                  ? "bg-red-500 animate-pulse scale-110"
                  : "bg-blue-500 hover:bg-blue-600 hover:scale-105"
              }`}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-2">👂</div>
                  <div>듣고 있어요!</div>
                </div>
              ) : isRecording ? (
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-2">🎤</div>
                  <div>말해주세요!</div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-2">🎤</div>
                  <div>증상 말하기</div>
                </div>
              )}
            </button>

            {childSymptoms && (
              <div className="mt-8 p-6 bg-blue-100 dark:bg-blue-900 rounded-2xl">
                <div className="text-3xl mb-2">💬</div>
                <p className="text-lg text-blue-800 dark:text-blue-200">{childSymptoms}</p>
              </div>
            )}
          </div>
        )}

        {currentStep === "completed" && (
          <div className="text-center space-y-8">
            <div className="text-8xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">잘했어요, {childName}!</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">보호자님이 확인해서 도와줄게요!</p>

            <div className="space-y-4">
              <button
                onClick={resetToStart}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-300 hover:scale-105"
              >
                🔄 다른 친구 기록하기
              </button>
            </div>
          </div>
        )}

        {/* 미완료 기록 목록 */}
        {savedRecords.filter((r) => !r.isCompleted).length > 0 && currentStep === "completed" && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">확인이 필요한 기록</h3>
            <div className="space-y-2">
              {savedRecords
                .filter((r) => !r.isCompleted)
                .map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{record.childName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {record.date} {record.time}
                      </p>
                    </div>
                    <button
                      onClick={() => switchToAdultMode(record)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
