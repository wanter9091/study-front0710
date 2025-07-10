"use client"

import { Calendar, Home, Mic, Users, Heart } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuthContext } from "@/src/context/AuthContext"

const menuItems = [
  { title: "대시보드", url: "/", icon: Home },
  { title: "환자 관리", url: "/patients", icon: Users },
  { title: "증상 입력", url: "/voice-upload", icon: Mic },
  { title: "달력", url: "/calendar", icon: Calendar },
  { title: "질병 정보", url: "/disease", icon: Heart },
  { title: "보호자 등록", url: "/guardians/register" },
]

export function TopNavigation() {
  const pathname = usePathname()
  const { isLoggedIn, logout } = useAuthContext()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* 로고 */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-blue-600">아이케어</span>
        </div>

        {/* 메뉴 및 로그인 */}
        <div className="flex items-center gap-1">
          {menuItems.map((item) => (
            <Button
              key={item.title}
              variant={pathname === item.url ? "default" : "ghost"}
              size="sm"
              asChild
              className={pathname === item.url ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100" : ""}
            >
              <Link href={item.url}>{item.title}</Link>
            </Button>
          ))}

          <div className="ml-2 flex items-center gap-1">
            <ThemeToggle />
            {isLoggedIn ? (
              <Button size="sm" variant="ghost" onClick={logout}>로그아웃</Button>
            ) : (
              <Button size="sm" variant="outline" asChild>
                <Link href="/login">로그인</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
