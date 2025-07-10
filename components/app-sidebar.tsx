"use client"

import { Calendar, FileText, Home, Mic, Users, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

const menuItems = [
  {
    title: "대시보드",
    url: "/",
    icon: Home,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "환자 관리",
    url: "/patients",
    icon: Users,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "음성 등록",
    url: "/voice-upload",
    icon: Mic,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "증상 히스토리",
    url: "/calendar",
    icon: Calendar,
    color: "from-orange-500 to-red-500",
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              소아 의료 보조
            </span>
            <span className="text-xs text-muted-foreground">AI 시스템</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} className="group">
                    <Link href={item.url} className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg bg-gradient-to-r ${item.color} shadow-sm group-hover:shadow-md transition-shadow`}
                      >
                        <item.icon className="h-4 w-4 text-white" />
                      </div>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gradient-to-r from-gray-400 to-gray-600 rounded-lg">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">설정</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
