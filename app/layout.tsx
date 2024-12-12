import './globals.css'
import { Inter } from 'next/font/google'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Stacker Onboarding Assistant',
  description: 'Experience our AI agent platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col h-full`}>
          <header className="flex-shrink-0 pt-6 pb-2 px-8 flex justify-start">
            <Image src="/logo.svg" alt="Company Logo" width={120} height={100} />
          </header>
          <main className="flex flex-1 flex-col w-full max-w-[1000px] mx-auto">
            {children}
          </main>
          <footer className="flex-shrink-0 p-4 text-center text-sm text-gray-500">
            <p>© 2024 Stacker</p>
          </footer>
      </body>
    </html>
  )
}

