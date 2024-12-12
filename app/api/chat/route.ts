import { createAgentStream } from "./agent";


export async function POST(req: Request) {

  const request = await req.json();

  console.log(request);

  const { messages, thread_id } = request;

  return createAgentStream(messages, thread_id);
}