import './globals.css'
import { Inter } from 'next/font/google'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Stacker Agent Signup',
  description: 'Experience our AI agent platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <header className="p-8 flex justify-start">
            <Image src="/logo.svg" alt="Company Logo" width={120} height={100} />
          </header>
          <main className="flex-grow flex items-center justify-center max-w-[1200px] mx-auto w-full">
            {children}
          </main>
          <footer className="p-4 text-center text-sm text-gray-500">
            <p>© 2024 Stacker. All rights reserved.</p>
            <p>Experience the future of AI agents.</p>
          </footer>
        </div>
      </body>
    </html>
  )
}

