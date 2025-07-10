// 📄 app/404.tsx
"use client"

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center">
      <h1 className="text-3xl font-bold">404 - 페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-500 mt-2">요청하신 페이지가 존재하지 않습니다.</p>
    </div>
  )
}
