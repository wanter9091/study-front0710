// ✅ app/disease/page.tsx (목록)
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Disease {
  id: number;
  title: string;
  category: string;
}

const categoryMap: { [key: string]: string } = {
  A: "감염",
  B: "내분비",
  C: "정신",
  D: "순환기",
  E: "호흡기",
  F: "소화기",
  G: "피부",
};

const categories = Object.entries(categoryMap);

export default function DiseasePage() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  useEffect(() => {
    axios
      .get(`${API_URL}/diseases`)
      .then((res) => setDiseases(res.data))
      .catch((err) => console.error("질병 목록을 불러오는 중 오류 발생:", err));
  }, []);

  const filteredDiseases = selectedCategory
    ? diseases.filter((d) => d.category === selectedCategory)
    : diseases;

  const paginated = filteredDiseases.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredDiseases.length / pageSize);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">🩺 질병 정보</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`px-3 py-1 rounded-full border ${selectedCategory === null ? "bg-blue-500 text-white" : "bg-white"}`}
          onClick={() => setSelectedCategory(null)}
        >
          전체
        </button>
        {categories.map(([code, name]) => (
          <button
            key={code}
            className={`px-3 py-1 rounded-full border ${selectedCategory === code ? "bg-blue-500 text-white" : "bg-white"}`}
            onClick={() => setSelectedCategory(code)}
          >
            {name}
          </button>
        ))}
      </div>

      {paginated.length === 0 ? (
        <p>해당 카테고리에 질병 정보가 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {paginated.map((disease) => (
            <li key={disease.id} className="p-4 border rounded-md shadow-sm hover:shadow-md">
              <Link href={`/disease/${disease.id}`} className="text-xl font-semibold text-blue-600">
                {disease.title}
              </Link>
              <p className="text-sm text-gray-500">카테고리: {categoryMap[disease.category] || disease.category}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 border rounded ${page === currentPage ? "bg-blue-500 text-white" : "bg-white"}`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
