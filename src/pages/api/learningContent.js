import { SequentialChain, LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from "langchain/prompts";
import { PromptTemplate } from "langchain/prompts";

const chat = new ChatOpenAI({ temperature: 1 });

const learningPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `You are a helpful tutor that helps students learn about any topic.
    Given a topic, it is your job to generate content for that topic which will help students learn deeply.
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

const depthLevelLLM = new ChatOpenAI({ temperature: 0.5 });

const depthLevelPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `You are a helpful tutor that helps students learn about any topic.
      Given a topic, depth_level and learning style, it is your job to generate content for that topic according to the specified depth_level and learning style.
      "description": "This is the depth of the content the student wants to learn. A low depth will cover the basics, and generalizations while a high depth will cover the specifics, details, unfamiliar, complex, and side cases. The lowest depth level is 1, and the highest is 5.",
      "depth_levels": 
          "Level_1": "Surface level: Covers topic basics with simple definitions and brief explanations, suitable for beginners or quick overviews.",
          "Level_2": "Expanded understanding: Elaborates basic concepts, introduces foundational principles, and explores connections for broader understanding.",
          "Level_3": "Detailed analysis: Provides in-depth explanations, examples, and context, discussing components, interrelationships, and relevant theories.",
          "Level_4": "Practical application: Focuses on real-world applications, case studies, and problem-solving techniques for effective knowledge application.",
          "Level_5": "Advanced concepts: Introduces advanced techniques and tools, covering cutting-edge developments, innovations, and research.",
          
          learning Styles:
            textbook: "Adopts textbook-style language with well-structured sentences and rich vocabulary.",
            layman: "Simplifies complex ideas with everyday language and relatable examples.",
            storyTelling: "Utilizes narratives and anecdotes to make ideas engaging and memorable.",
            socratic: "Stimulates curiosity through thought-provoking questions and self-directed learning.",
            analogical: "Fosters deep understanding by comparing similarities between concepts.",
            humorous: "Infuses wit and light-hearted elements for enjoyable, engaging content."
          
      topic: {topic}
      depth_level: {depth_level}
      learningStyle: {learningStyle}
      content:`
  ),
  HumanMessagePromptTemplate.fromTemplate("{topic}", "{depth_level}"),
]);


const depthLevelChain = new LLMChain({
  llm: depthLevelLLM,
  prompt: depthLevelPrompt,
  verbose: true,
})


const overallChain = new SequentialChain({
  chains: [topicChain, questionChain],
  inputVariables: ["topic"],
  outputVariables: ["content", "question"],
  verbose: true,
})

export default async function handler(req, res) {
  const { topic, depth_level, learningStyle } = req.body;
  console.log(topic, depth_level, "topic")

  try {
    let response;
    if (depth_level) {
      response = await depthLevelChain.call({
        topic: topic,
        depth_level: depth_level,
        learningStyle: learningStyle,
      });
      console.log(topic, depth_level, "topic");
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