/* eslint-disable */
const { onRequest } = require("firebase-functions/v2/https");
require("dotenv").config();
const cors = require("cors")({ origin: true });
const { SequentialChain, LLMChain } = require("langchain/chains");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { OpenAI } = require("langchain/llms/openai");
const { SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate } = require("langchain/prompts");
const { PromptTemplate } = require("langchain/prompts");


const chat = new ChatOpenAI({
  openAIApiKey: `${process.env.OPENAI_API_KEY}`,
  temperature: 1,
  streaming: true,
});

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
  openAIApiKey: `${process.env.OPENAI_API_KEY}`,
  temperature: 0.5,
  // streaming: true,
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

const depthLevelLLM = new ChatOpenAI({
  openAIApiKey: `${process.env.OPENAI_API_KEY}`,
  temperature: 0.5,
  streaming: true,
});

const depthLevelTemplate = (depth_level, learningStyle) => {
  let content = `You are a helpful tutor that helps students learn about any topic.
    Given a {topic}, {depth_level} and {learningStyle}, it is your job to generate content for that topic according to the specified depth_level and learning style.`
  switch (depth_level) {
    case 'Level_1':
      // Define Level_1 content
      content += `Imagine you have just heard about {topic} for the first time. 
        Provide a simple and brief explanation that covers the fundamental aspects. 
        Aim for a level of understanding appropriate for someone with no prior knowledge of the subject.`;
      break;
    case 'Level_2':
      // Define Level_2 content
      content += `Now that you have the basics of {topic}, dive deeper. 
        Explore and elaborate on the foundational principles, introduce related concepts, and describe how these ideas interconnect to form a broader understanding of the topic`;
      break;
    case 'Level_3':
      // Define Level_3 content
      content += `Let's delve further into {topic}. 
        Provide a comprehensive and detailed explanation. 
        Discuss the components, interrelationships, and relevant theories. 
        Use examples and give context where necessary to provide a full picture.`;
      break;
    case 'Level_4':
      // Define Level_4 content
      content += `With a solid understanding of {topic}, it's time to apply what you've learned. 
        Discuss real-world applications and case studies related to the topic. 
        Highlight problem-solving techniques that could be used in these situations`;
      break;
    case 'Level_5':
      // Define Level_5 content
      content += `At this depth level, you're ready to tackle the most advanced aspects of {topic}. 
        Introduce cutting-edge techniques, innovations, and recent research. 
        Discuss the potential future developments and implications of these advanced concepts.`;
      break;
  }

  switch (learningStyle) {
    case 'textbook':
      // Define textbook learning style
      content += `"Explain {topic} as if you're writing a chapter in a textbook. 
        Use well-structured sentences, a rich vocabulary, and maintain an academic tone. 
        Ensure the content is organized logically and cohesively.`;
      break;
    case 'layman':
      // Define layman learning style
      content += `Simplify {topic} for someone without any background in the subject. 
        Use everyday language, clear explanations, and relatable examples to make the topic easily understandable.`;
      break;
    case 'storyTelling':
      // Define storyTelling learning style
      content += `Narrate a story revolving around {topic}. 
        Use characters, plot, and setting to bring the topic to life. 
        The narrative should be engaging, memorable, and effectively convey the essential aspects of the topic.`;
      break;
    case 'socratic':
      // Define socratic learning style
      content += `Approach the explanation of {topic} through a series of thought-provoking questions. 
        Encourage self-directed learning and stimulate curiosity about the subject`;
      break;
    case 'analogical':
      // Define analogical learning style
      content += `Use analogies to explain {topic}. 
        Identify concepts that are similar to the topic and use these comparisons to foster a deeper understanding of the subject.`;
      break;
  }
  return content;
}

const overallChain = new SequentialChain({
  chains: [topicChain, questionChain],
  inputVariables: ["topic"],
  outputVariables: ["content", "question"],
  verbose: true,
})

exports.learningContent = onRequest(async (req, res) => {
  cors(req, res, async () => {

    const { topic, depth_level, learningStyle } = req.query;

    // Set up headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const depthLevelPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(depthLevelTemplate(depth_level, learningStyle)),
      HumanMessagePromptTemplate.fromTemplate("{topic}", "{depth_level}"),
    ]);

    const depthLevelChain = new LLMChain({
      llm: depthLevelLLM,
      prompt: depthLevelPrompt,
      verbose: true,
    })

    const handleLLMNewToken = (token) => {
      process.stdout.write(token);
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    };

    // const handleLLMError = (error) => {
    //   res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    // };

    try {
      let response;
      if (depth_level) {
        response = await depthLevelChain.call({
          topic: topic,
          depth_level: depth_level,
          learningStyle: learningStyle,
        }, [
          {
            handleLLMNewToken,
          },
        ]);
      } else {
        response = await overallChain.call({
          topic: topic,
        }, [
          {
            handleLLMNewToken,
            // handleLLMEnd,
            // handleLLMError,
          },
        ]);
      }

      // Send the response
      res.write(`data: ${JSON.stringify({ response })}\n\n`);

      // End the connection
      res.end();
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error }));
    }
  });
});

