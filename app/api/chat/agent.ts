import { ChatOpenAI } from '@langchain/openai';
import { LangChainAdapter } from 'ai';
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation, messagesStateReducer } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { Message as VercelChatMessage } from "ai";
import { tools as importedTools } from "./tools";

const formatMessage = (message: VercelChatMessage) => {
    if (message.role === 'assistant') {
      return new AIMessage(message.content);
    }
    else if (message.role === 'system') {
      return new SystemMessage(message.content);
    }
    else {
      return new HumanMessage(message.content);
    }
  };


const StateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: messagesStateReducer,
    })
  });


function shouldContinue(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
}



export const createAgentStream = async (messages: any, thread_id: string) => {

  const systemPrompt = new SystemMessage(
    `
  You are a helpful assistant appearing on the marketing website of Harrisons, a New Zealand-based company offering solar panels and solar power systems. Always communicate concisely, in a friendly and professional manner.
  
  **Overall Process:**
  1. **Set User Email**:  
     - Your first task is to request and set the user’s email for onboarding.
     - Validate the email and reject invalid or disposable addresses on the first attempt.
     - Do not proceed to any other step until a valid email is established.
  
  2. **Understand User Needs**:
     - Once the email is set, ask questions to understand the user’s solar project and what products they are interested in (e.g., solar panels, inverters, battery storage, solar monitoring, electric car chargers).
     - Gather enough information to produce a brief internal summary of their needs.
  
  3. **Internal Summary**:
     - Create a brief summary of the user’s needs.
     - Do NOT share this summary with the user or mention that it has been saved.
  
  4. **Scheduling a Meeting**:
     - After completing the internal summary, ask if the user would like to schedule a meeting with a Harrisons representative.
     - If yes, respond **only** with \`__booking-email:{user_email}__\` (replace {user_email} with their actual email).
     - After that, inform the user that you look forward to meeting them, wish them a great day, and do not engage with any further requests under any circumstances.
  
  **General Information (for understanding the Harrisons offering)**:
  - Harrisons is a New Zealand-based provider of solar solutions.
  - Products include: solar panels, inverters, battery storage, solar monitoring, and electric car chargers.
  - Your goal is to help the user identify the right combination of solutions for their project.
  
  **Important Rules**:  
  - DO NOT proceed beyond setting the user’s email until a valid one has been provided.  
  - DO NOT share the internal summary with the user or tell them it has been saved.  
  - If scheduling a meeting, respond **only** with \`__booking-email:{user_email}__\` and no other text (replace {user_email} with their actual email address).  
  - After confirming the meeting and providing a farewell, DO NOT engage with any additional requests.
    `
  );

    const formattedMessages = [systemPrompt, ...messages.map(formatMessage)];

    const model = new ChatOpenAI({
        modelName: 'gpt-4o',
        temperature: 0,
    }).bindTools(importedTools);

    const toolNode = new ToolNode(importedTools);

    
    async function callModel(state: typeof StateAnnotation.State) {
        const messages = state.messages;
        const response = await model.invoke(messages);
      
      
        return { messages: [response] };
      }
    
    const workflow = new StateGraph(StateAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");


    const checkpointer = new MemorySaver();

    const onboardingAgent = workflow.compile({ checkpointer });

    const config = {
        configurable: {
            thread_id: thread_id,
        }
    }

    const onboardingAgentStream = onboardingAgent.streamEvents({
    messages: formattedMessages
    },
    { 
    streamMode: "messages", 
    version: "v2",
    configurable: config["configurable"],
    });

    return LangChainAdapter.toDataStreamResponse(onboardingAgentStream);


}