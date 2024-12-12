"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-a rea";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import Image from "next/image";
import { InputForm } from "@/components/InputForm";
import { v4 as uuidv4 } from "uuid";
export function Chat() {
  const [thread_id] = useState(() => uuidv4());
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, isLoading, stop, handleInputChange, handleSubmit } =
    useChat({
      initialMessages: [
        {
          id: "1",
          role: "assistant",
          content: "Hi there, please share your email to get started!",
        }
      ],
      body: {
        thread_id: thread_id,
      },
    });

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ScrollArea.Root className="relative flex-1 min-h-0">
        <ScrollArea.Viewport ref={viewportRef} className="absolute inset-0">
          <div className="p-4">
            {messages
              .filter((message) => message.role !== "system")
              .map((message, index, array) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end " : "justify-start"
                  } mb-4`}
                >
                  {message.role === "assistant" && (
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
                      message.role === "user"
                        ? "bg-gray-200 text-black py-2 px-4 rounded-full"
                        : "bg-white text-black"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center mb-1">
                        <span className="text-gray-500">
                          Onboarding Assistant
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-center justify-start mb-4">
                <div className="flex-shrink-0 mr-4">
                  <Image
                    src="/stacker_chat_avatar.png"
                    alt="Stacker Agent"
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                </div>
                <div className="flex items-center">
                  <p className="thinking-gradient">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar 
          orientation="vertical" 
          className="flex w-0"
        >
          <ScrollArea.Thumb 
            className="relative flex-1 rounded-full opacity-0"
          />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
      <InputForm
        input={input}
        isLoading={isLoading}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        stop={stop}
      />
    </div>
  );
}
