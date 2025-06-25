
// This file contains utility functions for interacting with AI APIs (OpenAI and GROQ)

export type AIProvider = "openai" | "groq";

export interface OpenAiGenerateParams {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  provider?: AIProvider;
  apiKey?: string;
  apiBaseUrl?: string; // Added for custom API endpoints
  organizationId?: string; // Added for OpenAI organization ID
}

// The API keys are placeholders - in a real app, you'd get this from environment variables
// or a secure backend service
const OPENAI_API_KEY = "masked-for-security"; // Masked for security
const GROQ_API_KEY = "masked-for-security"; // Masked for security

// Default API endpoints
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function generateOpenAiContent({
  prompt,
  systemPrompt = "Você é um especialista em marketing imobiliário com experiência em criar conteúdo envolvente.",
  temperature = 0.7,
  maxTokens = 1000,
  model = "gpt-4o",
  provider = "openai",
  apiKey,
  apiBaseUrl,
  organizationId,
}: OpenAiGenerateParams): Promise<string> {
  try {
    if (provider === "openai") {
      return await generateWithOpenAI(
        prompt, 
        systemPrompt, 
        temperature, 
        maxTokens, 
        model, 
        apiKey, 
        apiBaseUrl, 
        organizationId
      );
    } else if (provider === "groq") {
      return await generateWithGROQ(
        prompt, 
        systemPrompt, 
        temperature, 
        maxTokens, 
        model, // Pass model to GROQ too
        apiKey,
        apiBaseUrl
      );
    } else {
      throw new Error("Provedor de IA não suportado");
    }
  } catch (error) {
    console.error(`Error generating content with ${provider}:`, error);
    throw new Error(`Falha ao comunicar com a API do ${provider === "openai" ? "OpenAI" : "GROQ"}`);
  }
}

async function generateWithOpenAI(
  prompt: string,
  systemPrompt: string,
  temperature: number,
  maxTokens: number,
  model: string,
  apiKey?: string,
  apiBaseUrl?: string,
  organizationId?: string
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey || OPENAI_API_KEY}`
  };

  // Add organization ID if provided
  if (organizationId) {
    headers["OpenAI-Organization"] = organizationId;
  }

  const response = await fetch(apiBaseUrl || OPENAI_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: temperature,
      max_tokens: maxTokens
    })
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || "Erro ao gerar conteúdo com a OpenAI");
  }
  
  return data.choices[0]?.message?.content || "Não foi possível gerar o conteúdo.";
}

async function generateWithGROQ(
  prompt: string,
  systemPrompt: string,
  temperature: number,
  maxTokens: number,
  model: string = "llama3-70b-8192", // Default GROQ model
  apiKey?: string,
  apiBaseUrl?: string
): Promise<string> {
  const response = await fetch(apiBaseUrl || GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey || GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: model, // Use the model parameter or default to llama3-70b-8192
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: temperature,
      max_tokens: maxTokens
    })
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || "Erro ao gerar conteúdo com a GROQ");
  }
  
  return data.choices[0]?.message?.content || "Não foi possível gerar o conteúdo.";
}
