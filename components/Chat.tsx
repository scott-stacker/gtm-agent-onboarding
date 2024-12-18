"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import Image from "next/image";
import { InputForm } from "@/components/InputForm";
import { useCalendlyEventListener, InlineWidget } from "react-calendly";
import { v4 as uuidv4 } from "uuid";
import { CalendarCheck } from "lucide-react";
import { Message as VercelChatMessage } from "ai";
export function Chat() {
  const [thread_id] = useState(() => uuidv4());
  const [meeting_booked, setMeetingBooked] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  useCalendlyEventListener({
    onEventScheduled: () => {
      setMeetingBooked(true);
      appendMeetingBookedMessage();
      reload();
    },
  });

  const {
    messages,
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
    setMessages,
    reload,
  } = useChat({
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: "Hi there, please share your email to get started!",
      },
    ],
    body: {
      thread_id: thread_id,
    },
  });

  const appendMeetingBookedMessage = () => {
    const lastMessage = messages[messages.length - 1];

    const nextId = lastMessage.id ? parseInt(lastMessage.id) + 1 : 1;

    setMessages([
      ...messages,
      {
        id: nextId.toString(),
        role: "system",
        content: "The user has now booked a meeting.",
      },
    ]);
  };

  const renderAssistantImage = () => {
    return (
      <Image
        src="/stacker_chat_avatar.png"
        alt="Stacker Agent"
        width={30}
        height={30}
        className="rounded-full"
      />
    );
  };

  const renderAssistantMessage = (message: VercelChatMessage) => {
    return (
      <div key={message.id} className="flex justify-start my-4">
        <div className="flex-shrink-0 mr-4">
          {renderAssistantImage()}
        </div>
        <div className={"max-w-[70%] bg-white text-black"}>
          <div className="flex items-center mb-1">
            <span className="text-gray-500">Onboarding Assistant</span>
          </div>
          <p className="whitespace-pre-wrap">{String(message.content)}</p>
        </div>
      </div>
    );
  };

  const renderUserMessage = (message: VercelChatMessage) => {
    return (
      <div key={message.id} className="flex justify-end my-4">
        <div className="max-w-[70%] bg-gray-200 text-black py-3 px-4 rounded-2xl">
          <p>{String(message.content)}</p>
        </div>
      </div>
    );
  };

  const renderCalendlyLoadingSpinner = () => {
    return null;
  };

  const renderCalendly = (meeting_booked: boolean, email: string | null) => {
    return (
      <div className="flex pl-0 pb-4 sm:pl-12">
        <div
          className={`
            flex items-center border border-gray-200 rounded-lg overflow-hidden
            transition-all duration-500 ease-in-out
            ${
              meeting_booked
                ? "w-full max-w-[500px] h-[60px] p-4"
                : "w-full max-w-[500px] h-[610px]"
            }
          `}
          key="calendly"
        >
          {meeting_booked ? (
            <div className="flex items-center opacity-0 translate-x-2 animate-fade-in">
              <CalendarCheck className="w-4 h-4 mr-2" />
              <p>Meeting booked</p>
            </div>
          ) : (
            <InlineWidget
              url={`https://calendly.com/scott-stacker/test-meeting?email=${email}`}
              pageSettings={{
                hideEventTypeDetails: true,
                hideLandingPageDetails: true,
                hideGdprBanner: true,
              }}
              LoadingSpinner={renderCalendlyLoadingSpinner}
              styles={{
                height: "100%",
                width: "100%",
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const renderBookingMessage = (message: VercelChatMessage) => {

    const email = message.content?.includes(":")
      ? message.content.split(":")[1]?.replace("__", "")?.trim()
      : null;

    return (
      <div className="flex-col" key={message.id}>
        <div className="flex justify-start mb-4">
          <div className="flex-shrink-0 mr-4">
            {renderAssistantImage()}
          </div>

          <div className={"max-w-[70%] bg-white text-black"}>
            <div className="flex items-center mb-1">
              <span className="text-gray-500">Onboarding Assistant</span>
            </div>
            <p className="whitespace-pre-wrap">
              Great, please select a time for your onboarding call:
            </p>
          </div>
        </div>

        {renderCalendly(meeting_booked, email)}
      </div>
    );
  };

  const renderMessage = (message: VercelChatMessage) => {

    if (message.role === "system") {
      return null;
    } else if (message.content.startsWith("__b")) {
      return renderBookingMessage(message);
    } else if (message.role === "assistant") {
      return renderAssistantMessage(message);
    } else {
      return renderUserMessage(message);
    }
  };


  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 min-h-0 px-4 pb-4 sm:pb-8">
      <ScrollArea.Root className="relative flex-1 min-h-0">
        <ScrollArea.Viewport
          ref={viewportRef}
          className="absolute inset-0 px-0 sm:px-4"
        >
          <div className="pb-4 sm:pb-12">
            {messages.map((message) => renderMessage(message))}
            {isLoading &&
              messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-center justify-start mb-4">
                  <div className="flex-shrink-0 mr-4">
                    {renderAssistantImage()}
                  </div>
                  <div className="flex items-center">
                    <p className="thinking-gradient">Thinking...</p>
                  </div>
                </div>
              )}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" className="flex w-0">
          <ScrollArea.Thumb className="relative flex-1 rounded-full opacity-0" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
      <InputForm
        input={input}
        isLoading={isLoading}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
