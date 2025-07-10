import { ThemeProvider } from "@/components/theme-provider"
import { TopNavigation } from "@/components/top-navigation"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/src/context/AuthContext"
import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import "@/styles/globals.css"
import { cn } from "@/lib/utils"

const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "아이케어",
  description: "소아 환자 증상 관리 및 진료 요약 지원 시스템",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <TopNavigation />
            <main className="pt-6">{children}</main>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
