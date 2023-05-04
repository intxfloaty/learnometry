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
      content:`
  ),
  HumanMessagePromptTemplate.fromTemplate("{topic}"),
]);


const topicChain = new LLMChain({
  prompt: learningPrompt,
  llm: chat,
  outputKey: "content",
});

const questionLLM = new OpenAI({
  temperature: 0.5,
})

const questionTemplate = `You are a helpful prompt generator that generates question prompts .
Given the content for a topic, it is your job to generate question prompts.
Asks thought-provoking questions to stimulate intellectual curiosity, critical thinking, and self-directed learning.
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

const explainLikeFiveLLM = new ChatOpenAI({ temperature: 0.5 });

const explainLikeFivePrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `You are a helpful tutor that helps students learn about any topic.
    Given the content for a topic, it is your job to explain the content in a way that a 10 year old would understand.
    content: {content}
      Explanation:`
  )
]);


const likeFiveChain = new LLMChain({
  llm: explainLikeFiveLLM,
  prompt: explainLikeFivePrompt,
  outputKey: "Explanation",
})

const explainLikeFiveChain = new SequentialChain({
  chains: [topicChain, likeFiveChain],
  inputVariables: ["topic"],
  outputVariables: ["Explanation"],
  verbose: true,
})

const overallChain = new SequentialChain({
  chains: [topicChain, questionChain],
  inputVariables: ["topic"],
  outputVariables: ["content", "question"],
  verbose: true,
})

export default async function handler(req, res) {
  const { topic, action } = req.body;

  try {
    let response;
    if (action === 'explainLikeFive') {
      response = await explainLikeFiveChain.call({
        topic: topic,
      });
    } else {
      response = await overallChain.call({
        topic: topic,
      });
    }
    res.status(200).json(response);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error });
  }
}