"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Disease {
  id: number;
  title: string;
  content: string;
  category: string;
}

export default function DiseaseDetailPage() {
  const params = useParams();
  const { id } = params;
  const [disease, setDisease] = useState<Disease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisease = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/diseases/${id}`);
        setDisease(response.data);
      } catch (err) {
        console.error("질병 상세 정보를 불러오는 중 오류 발생:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDisease();
  }, [id]);

  if (loading) return <p className="p-6">불러오는 중...</p>;
  if (!disease) return <p className="p-6">질병 정보를 찾을 수 없습니다.</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-2">{disease.title}</h1>
      <p className="text-sm text-gray-500 mb-4">카테고리: {disease.category}</p>

      {/* ✅ 핵심 변경 부분 */}
      <div className="whitespace-pre-line text-base leading-relaxed text-gray-800">
        {disease.content}
      </div>
    </div>
  );
}
