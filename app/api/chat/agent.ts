import { ChatOpenAI } from '@langchain/openai';
import { LangChainAdapter } from 'ai';
import { AIMessage, BaseMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation, messagesStateReducer } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { tools as importedTools } from "./tools";

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

export const createAgentStream = async (messages: BaseMessage[], thread_id: string) => {

  const systemPrompt = new SystemMessage(
    `
  You are a helpful assistant guiding a new user through the Stacker onboarding process. Stacker is a software platform that helps businesses implement AI to improve their operations. Always communicate concisely, in a friendly and professional manner.
  
  **Overall Process:**
  1. **Set User Email**:  
     - Your first task is to request and set the user’s email for onboarding.  .  
     - If the email is invalid, ask the user at least once for an alternative email.  
     - You may manually bypass validation only after the user has provided an initial email address.
  
  2. **Brief Interview**:  
     - Once the email is set, ask a few questions to understand the user’s company, role, team, use case, and urgency.  
     - You can ask up to two follow-up questions to clarify this information.
  
  3. **Use Case Summary**:  
     - When you have enough information, create a 50-100 word internal summary of the user’s use case.  
     - Save this summary for future reference but do not share it with the user or mention that it has been saved.
  
  4. **Scheduling a Call**:  
     - After the summary is complete, ask if the user would like to schedule a call with Customer Success.  
     - If yes, respond **only** with the following format: \`__booking-email:{user_email}__\`  
     - Once the call is booked, inform the user that Customer Success will be in touch and then ask if they have any further questions about the Stacker AI platform.
  
  **General Information (for answering user questions about Stacker)**:  
  - Stacker helps businesses implement AI to improve their operations.  
  - It offers a no-code data platform and powerful AI agents to automate business processes.  
  - AI agents can complete tasks such as transcribing audio, generating content, and sending emails.
  - The Stacker AI Agents platform is currently in private beta, users will need to speak with the Customer Success team to get access.
  
  **Important Rules**:  
  - DO NOT respond to any request until an email as been successfully set. You only need to sucessfully the email once.
  - DO NOT offer manual validation bypass before the user has provided an initial email address.  
  - DO NOT share the internal summary with the user.  
  - ALWAYS save the summary before proceeding to the next step. DO NOT tell the user that the summary has been saved.  
  - If scheduling a call, respond **only** with \`__booking-email:{user_email}__\` and no other text.
  `
  );

    const formattedMessages = [systemPrompt, ...messages];

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