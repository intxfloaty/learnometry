import { SequentialChain, LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from "langchain/prompts";
import { PromptTemplate } from "langchain/prompts";

const chat = new ChatOpenAI({ temperature: 0 });


const learningPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `You are a helpful tutor that helps students learn about any topic.
    Given a topic, it is your job to generate content for that topic.
    Topic: {topic}
      content:`),
  HumanMessagePromptTemplate.fromTemplate("{topic}"),
]);


const topicChain = new LLMChain({
  prompt: learningPrompt,
  llm: chat,
  outputKey: "content",
});


// const topicLLM = new OpenAI({
//   temperature: 0.5,
// })

// const topicTemplate = `You are a helpful tutor that helps students learn about any topic.
// Given a topic, it is your job to generate a summary of the topic.
// Topic: {topic}
//   Summary:`

// const topicPromptTemplate = new PromptTemplate({
//   template: topicTemplate,
//   inputVariables: ["topic"],
// })

// const topicChain = new LLMChain({
//   llm: topicLLM,
//   prompt: topicPromptTemplate,
//   outputKey: "summary",
// })

const questionLLM = new OpenAI({
  temperature: 0.5,
})

const questionTemplate = `You are a helpful prompt generator that generates question prompts .
Given the content for a topic, it is your job to generate question prompts.
content : {content}`

const questionPromptTemplate = new PromptTemplate({
  template: questionTemplate,
  inputVariables: ["content"],
})

const questionChain = new LLMChain({
  llm: questionLLM,
  prompt: questionPromptTemplate,
  outputKey: "question",
})

const overallChain = new SequentialChain({
  chains: [topicChain, questionChain],
  inputVariables: ["topic"],
  outputVariables: ["content", "question"],
  verbose: true,
})

export default async function handler(req, res) {
  const { topic } = req.body;

  try {
    const response = await overallChain.call({
      topic: topic,
    });
    res.status(200).json(response);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error });
  }
}