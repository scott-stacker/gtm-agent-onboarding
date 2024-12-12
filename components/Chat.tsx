'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AudioInput } from './AudioInput'
import Image from 'next/image'
import { v4 as uuidv4 } from 'uuid';
export function Chat() {
  const [thread_id] = useState(() => uuidv4());
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: [
      {
        id: '2',
        role: 'assistant',
        content: "Hi there, please share your email to get started!",
      },
    ],
    body: {
      thread_id: thread_id,
    }
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)


  return (
    <div className="rounded-lg">
      <div className="p-2 sm:p-4 md:p-6">
        <ScrollArea className="h-[600px] pr-4" ref={scrollAreaRef}>
          {messages.filter(message => message.role !== 'system').map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end ' : 'justify-start'
              } mb-4`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 mr-4">
                  <Image 
                    src="/stacker_chat_avatar.png" 
                    alt="Stacker Agent" 
                    width={30} 
                    height={30}
                    className="rounded-full"
                  />
                </div>
              )}
              <div
                className={`max-w-[70%] ${
                  message.role === 'user' 
                    ? 'bg-gray-200 text-black py-2 px-4 rounded-full' 
                    : 'bg-white text-black'
                }`} 
              >
                {message.role === 'assistant' && (
                  <div className="mb-1">
                    <span className="text-gray-500">Onboarding Assistant</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="p-2 sm:p-4 md:p-6">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              placeholder="Message Stacker Onboarding Assistant"
              value={input}
              onChange={handleInputChange}
              className="flex-grow rounded-lg"
            />
            <div className="flex space-x-2">
              {/* <AudioInput onTranscript={handleAudioTranscript} /> */}
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

