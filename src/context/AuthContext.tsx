"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface AuthContextType {
  user: any
  setUser: (user: any) => void
  isLoggedIn: boolean
  userId: number | null
  login: (token: string) => void
  logout: () => void
  guardian: any
  setGuardian: (g: any) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [guardian, setGuardian] = useState<any>(null)
  const isLoggedIn = !!user
  const userId = user?.id ?? null

  const login = async (token: string) => {
    try {
      localStorage.setItem("token", token)
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(res.data)
  
      // 보호자 정보는 실패해도 로그인 유지
      try {
        const gRes = await axios.get(`${API_URL}/guardians/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setGuardian(gRes.data)
      } catch (gErr) {
        console.warn("⚠️ 보호자 정보 없음 (무시):", gErr)
        setGuardian(null)
      }
  
    } catch (e) {
      console.error("❌ 로그인 후 정보 조회 실패:", e)
      setUser(null)
      setGuardian(null)
    }
  }
  

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    setGuardian(null)
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) login(token)
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, isLoggedIn, userId, login, logout, guardian, setGuardian }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuthContext must be used within AuthProvider")
  return context
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
