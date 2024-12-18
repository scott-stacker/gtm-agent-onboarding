import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { LangGraphRunnableConfig } from "@langchain/langgraph";

const headers = {
    "x-stack-id": "app785vwedw46e3bx8",
    "x-integration-key": process.env.STACKER_INTEGRATION_KEY || '',
    "Content-Type": "application/json",
  };

async function setEmail(email: string, thread_id: string) {

    const url = 'https://api.go.stackerhq.com/api/external/objects/object.custom.leads/records/'

    const body = {
        leads__email: email,
        leads__thread_id: thread_id,
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

    if (validation_result.status === 'invalid' || validation_result.webmail || validation_result.disposable) {
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
  description: 'Set the user email for the onboarding process. This tool automatically validates the email address and rejects invalid emails, free webmails and disposable emails. You can manually bypass the validation check if required.',
  schema: z.object({
    email: z.string().describe("Email address to validate."),
    validation_bypass: z.boolean().optional().describe("If true, will bypass the validation check."),
  })
});

export const saveUseCaseSummary = tool(async (input: {summary: string}, config: LangGraphRunnableConfig) => {

    const thread_id = config.configurable?.thread_id;

    const url = 'https://api.go.stackerhq.com/api/external/objects/object.custom.leads/records/' + thread_id + "/"

    const body = {
        leads__use_case_summary: input.summary,

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
    name: 'save_use_case_summary',
    description: 'Save the use case summary.',
    schema: z.object({
        summary: z.string().describe("50-100 words describing the use case."),
    })
});

export const tools = [setUserEmail, saveUseCaseSummary]; 