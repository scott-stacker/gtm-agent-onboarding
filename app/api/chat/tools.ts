import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const isEmailValid = tool(async (input) => {

    const url = `https://api.hunter.io/v2/email-verifier?email=${input.email}&api_key=${process.env.HUNTER_API_KEY}`;
    const response = await fetch(url);
    const { data } =await response.json();

    console.log(data);

    const result = {
        status: data.status,
        webmail: data.webmail,
        disposable: data.disposable,

    }

    if (result.status === 'invalid' || result.webmail || result.disposable) {
        return {
            is_valid: false,
            reason: result
        }
    }

    return {
        is_valid: true,
        reason: result
    }

}, {
  name: 'is_email_valid',
  description: 'Will check if the email address is valid for onboarding. We do not accept webmail and disposable emails.',
  schema: z.object({
    email: z.string().describe("Email address to validate."),
  })
});

export const tools = [isEmailValid]; 