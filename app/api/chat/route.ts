import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages, data } = await req.json()
  const email = data?.email

  const initialMessage = messages[0].content

  // Prepare the messages for the API call
  const apiMessages = messages.slice(1).map((message: any) => ({
    role: message.role,
    content: message.content,
  }))

  // Add a system message to guide the AI's behavior
  apiMessages.unshift({
    role: 'system',
    content: `You are Stacker Agent, an AI assistant for a lead capture form. Your goal is to collect information from users interested in an AI agent platform. Start by confirming their email address, then ask about their use case, company size, and current challenges. Be friendly and engaging. The user's email is: ${email}`,
  })

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: apiMessages,
  })

  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}

