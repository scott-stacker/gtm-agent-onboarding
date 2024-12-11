'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Mic, MicOff } from 'lucide-react'

interface AudioInputProps {
  onTranscript: (transcript: string) => void
}

export function AudioInput({ onTranscript }: AudioInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')

        onTranscript(transcript)
      }

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error)
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [onTranscript])

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop()
    } else {
      recognition?.start()
    }
    setIsListening(!isListening)
  }

  return (
    <Button 
      onClick={toggleListening} 
      variant="outline"
      className={isListening ? "bg-red-100" : ""}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  )
}

