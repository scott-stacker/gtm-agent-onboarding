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
    }),
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
      "You are a helpful assistant. " +
      "You must first validate the user's email address. " + 
      "Don't not answer any questions until you have been provided with a valid email address." +
      "After that you are to interview the user about their use case for an AI agent platform in their business." +
      "You are to ask them questions about their business, their use case, and their goals." 
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

    const onboardingAgentStream = onboardingAgent.streamEvents({
    messages: formattedMessages
    },
    { 
    streamMode: "messages", 
    version: "v2",
    configurable: {
        thread_id: thread_id,
    }
    });

    return LangChainAdapter.toDataStreamResponse(onboardingAgentStream);


}