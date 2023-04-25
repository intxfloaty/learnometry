import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";

const chat = new ChatOpenAI({ temperature: 0 });


const learningPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "You are a helpful tutor that helps students learn about any {topic}."
  ),
  HumanMessagePromptTemplate.fromTemplate("{topic}"),
]);


const chain = new LLMChain({
  prompt: learningPrompt,
  llm: chat,
});

export default async function handler(req, res) {
  const { topic } = req.body;

  try {
    const response = await chain.call({
      topic: topic,
    });
    res.status(200).json(response);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error });
  }
}

