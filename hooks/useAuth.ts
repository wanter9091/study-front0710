"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/src/context/AuthContext"

export function useAuth() {
  const context = useAuthContext()
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

// ✅ 로그인 상태 확인 및 페이지 보호
export function useAuthGuard() {
  const { isLoggedIn } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])
}
