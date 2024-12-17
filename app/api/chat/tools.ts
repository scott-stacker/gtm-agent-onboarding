import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { LangGraphRunnableConfig } from "@langchain/langgraph";

const headers = {
    "x-stack-id": "app69tukdg6px5eah5",
    "x-integration-key": "55883952-629d-4b65-a0a2-77f94157ff41",
    "Content-Type": "application/json",
  };

async function setEmail(email: string, thread_id: string) {

    const url = 'https://api.go.stackerhq.com/api/external/objects/object.custom.customer_chats/records/'

    const body = {
        customer_chats__email: email,
        customer_chats__thread_id: thread_id,
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    
    if (!response.ok) {
        throw new Error('Failed to set email');
    }   
}

export const setUserEmail = tool(async (input, config: LangGraphRunnableConfig) => {

    const thread_id = config.configurable?.thread_id;

    if (input.validation_bypass) {
        setEmail(input.email, thread_id);
        return {
            email_set: true
            }
        }

    const url = `https://api.hunter.io/v2/email-verifier?email=${input.email}&api_key=${process.env.HUNTER_API_KEY}`;
    const response = await fetch(url);
    const { data } =await response.json();

    const validation_result = {
        status: data.status,
        webmail: data.webmail,
        disposable: data.disposable,

    }

    if (validation_result.status === 'invalid' ) {
        return {
            email_set: false,
            validation_result: validation_result,
        }
    } else {
        setEmail(input.email, thread_id);
        return {
            email_set: true
        }
    }

}, {
  name: 'set_user_email',
  description: 'Will set the user email for the onboarding process By default, we validate the email address and reject invalid emails and disposable emails.',
  schema: z.object({
    email: z.string().describe("Email address to validate."),
    validation_bypass: z.boolean().optional().describe("If true, will bypass the validation check."),
  })
});

export const setUseCaseSummary = tool(async (input: {summary: string}, config: LangGraphRunnableConfig) => {

    const thread_id = config.configurable?.thread_id;

    const url = 'https://api.go.stackerhq.com/api/external/objects/object.custom.customer_chats/records/' + thread_id + "/"

    const body = {
        customer_chats__description: input.summary,

    }

    const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });
    
    if (!response.ok) {
        throw new Error('Failed to set email');
    }
    
    if (response.ok) {
        return "Use case summary set"
    } else {
        throw new Error('Failed to set use case summary');
    }

}, {
    name: 'set_use_case_summary',
    description: 'Save a brief use case summary in the CRM for the current lead.',
    schema: z.object({
        summary: z.string().describe("50-100 words describing the use case."),
    })
});

export const tools = [setUserEmail, setUseCaseSummary]; 