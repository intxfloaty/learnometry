/* eslint-disable */
const functions = require("firebase-functions");
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

const crypto = require('crypto');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.createUserRecord = functions.auth.user().onCreate((user) => {
  const docRef = admin.firestore().collection('users').doc(user.uid);

  return docRef.set({
    email: user.email,
    uid: user.uid,
    responseCount: 25, // assuming the user has 25 responses initially
    subscriber: false, // assuming the user is not a subscriber initially
    timestamp: new Date(),
  })
    .then(() => {
      console.log('User Data Successfully Written for: ', user.uid);
      return null;
    })
    .catch((error) => {
      console.error('Error writing user document:', error);
    });
});


const chat = new ChatOpenAI({
  openAIApiKey: `${process.env.OPENAI_API_KEY}`,
  modelName: "gpt-3.5-turbo-0613",
  temperature: 1,
  streaming: true,
});

const learningPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `You are a knowledgeable and engaging tutor, skilled in making any topic interesting and stimulating.
    Your mission is to create comprehensive and captivating content on the given topic, incorporating key facts, 
    interesting anecdotes, analogies, examples, and interactive elements that will help students delve deeper 
    into the subject. 
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

const questionLLM = new ChatOpenAI({
  openAIApiKey: `${process.env.OPENAI_API_KEY}`,
  temperature: 1,
  // streaming: true,
})

const questionTemplate = `You are a helpful prompt generator that generates question prompts .
  Given the content of a topic, generate thought-provoking questions to stimulate intellectual curiosity, critical thinking, and self-directed learning based on the content.
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
  modelName: "gpt-3.5-turbo-0613",
  temperature: 1,
  streaming: true,
});

const depthLevelTemplate = (depth_level, learningStyle) => {
  let content = `You are a knowledgeable and engaging tutor, skilled in making any topic interesting and stimulating.
  Given a topic, depth_level and learningStyle, your mission is to create comprehensive, captivating, and interactive content that will help students gain a deeper and richer understanding of the topic.
  Topic: {topic}
  depth_level : {depth_level}
  learningStyle: {learningStyle}`
  switch (depth_level) {
    case 'Level_1':
      content += `Imagine you are introducing {topic} to a curious learner for the first time. 
      Provide a simple and engaging explanation that covers the fundamental aspects. 
      Aim for a level of understanding appropriate for someone with no prior knowledge of the subject.`;
      break;
    case 'Level_2':
      content += `Assuming a learner knows nothing more than the basics of {topic}, dive deeper. 
      Explore and elaborate on the foundational principles, introduce related concepts, and describe how these ideas interconnect, without reliance on information beyond a basic understanding.`;
      break;
    case 'Level_3':
      content += `Providing a stand-alone comprehensive exploration into {topic}, offer a detailed explanation. 
      Discuss the components, interrelationships, and relevant theories. Use examples and contexts to provide a complete picture. 
      How about presenting a challenge or a critical thinking task to inspire further learning?`;
      break;
    case 'Level_4':
      content += `Now, let's consider {topic} in a practical context. Your learner has a general understanding of the topic, but needs to see its real-world relevance. 
      Share the ways this topic is applied in real-world situations and present case studies that highlight its importance. 
      Explain problem-solving techniques related to the topic and pose a scenario where the learner can apply these techniques. 
      Keep in mind that the learner has a foundational understanding, but might not be familiar with more advanced or detailed aspects of the topic.`;
      break;
    case 'Level_5':
      content += `Now, let's push the boundaries of {topic}. At this level, you're introducing learners to the cutting-edge and advanced aspects of the subject. 
      Discuss the latest techniques, groundbreaking innovations, and recent research related to the topic. 
      Explore potential future developments and their implications.
      Perhaps you could propose a thought-provoking question or a research problem that will inspire learners to investigate these advanced concepts further.`;
      break;
  }

  switch (learningStyle) {
    case 'Textbook':
      content += `Imagine you're writing a chapter in a textbook about {topic}. 
      Maintain an academic tone. Structure the content logically and cohesively, and propose review questions at the end of each section.`;
      break;
    case 'Layman':
      content += `Explain {topic} in everyday language, using clear explanations and relatable examples. 
      Make the content engaging by using a friendly and conversational tone. Can you provide a metaphor or a real-life example that makes the topic easily understandable?`;
      break;
    case 'Socratic':
      content += `Approach the explanation of {topic} through a series of thought-provoking questions. 
      Encourage self-directed learning and stimulate curiosity. What questions could lead to intriguing discussions or stimulate further research on the topic?`;
      break;
    case 'Analogical':
      content += `Use analogies to explain {topic}. 
      Identify concepts that are similar to the topic and use these comparisons to foster a deeper understanding. 
      Provide a vivid or surprising analogy that will make the learning experience more memorable`;
      break;
    case 'ELI5':
      content += `Imagine explaining {topic} to a 5-year-old. 
        Use simple language, relatable examples, and metaphors that a child could understand. 
        The key here is to break down the concept and make it as clear and entertaining as possible. 
        Can you think of a way to relate the topic to something a 5-year-old might encounter in their daily life or in their favorite stories or games?`;
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

    const { topic, depth_level, learningStyle, uid } = req.query;


    const userDocRef = admin.firestore().collection('users').doc(uid);

    // Fetch user data
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      console.error('User not found');
      res.status(404).send('User not found');
      return;
    }

    const userData = userDoc.data();

    // If user is not a subscriber and responseCount is 0, deny access
    if (!userData.subscriber && userData.responseCount <= 0) {
      console.error('No responses left');
      res.status(403).send('No responses left');
      return;
    }

    // If user is not a subscriber, decrement responseCount
    if (!userData.subscriber) {
      await userDocRef.update({
        responseCount: admin.firestore.FieldValue.increment(-1),
      });
    }

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


exports.upgradePlan = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const apiKey = process.env.NEXT_PUBLIC_LEMONSQUEEZY_API_KEY;
    const userId = req.body.userId;
    const plan = req.body.plan;
    let variantId;

    try {

      if (plan === 'plus') {
        // Fetch variant id
        const variantsResponse = await fetch(
          `https://api.lemonsqueezy.com/v1/variants?filter[product_id]=77354`,
          {
            method: "GET",
            headers: {
              'Accept': 'application/vnd.api+json',
              "Content-Type": "application/vnd.api+json",
              "Authorization": `Bearer ${apiKey}`,
            }
          }
        );

        const variantsData = await variantsResponse.json();
        variantId = variantsData.data[0]?.id;  // Assuming the data has this structure. Update if necessary.

        if (!variantId) {
          res.status(400).json({ error: 'Variant ID not found' });
          return;
        }

      } else {
        // Fetch variant id
        const variantsResponse = await fetch(
          `https://api.lemonsqueezy.com/v1/variants?filter[product_id]=81783`,
          {
            method: "GET",
            headers: {
              'Accept': 'application/vnd.api+json',
              "Content-Type": "application/vnd.api+json",
              "Authorization": `Bearer ${apiKey}`,
            }
          }
        );

        const variantsData = await variantsResponse.json();
        variantId = variantsData.data[0]?.id;  // Assuming the data has this structure. Update if necessary.

        if (!variantId) {
          res.status(400).json({ error: 'Variant ID not found' });
          return;
        }
      }

      // Create checkout with the obtained variant id
      const checkoutsResponse = await fetch(
        `https://api.lemonsqueezy.com/v1/checkouts`,
        {
          method: "POST",
          headers: {
            'Accept': 'application/vnd.api+json',
            "Content-Type": "application/vnd.api+json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            "data": {
              "type": "checkouts",
              "attributes": {
                "checkout_data": {
                  "custom": {
                    "user_id": userId
                  }
                }
              },
              "relationships": {
                "store": {
                  "data": {
                    "type": "stores",
                    "id": "27742"
                  }
                },
                "variant": {
                  "data": {
                    "type": "variants",
                    "id": variantId  // Use the obtained variant id
                  }
                }
              }
            }
          }),
        }
      );

      const checkoutsData = await checkoutsResponse.json();
      res.status(200).json(checkoutsData);
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }

  });
});


const saveWebhookData = async (userId, docId, data) => {
  try {
    const docRef = await db.collection('users')
      .doc(userId)
      .collection('webhookData')
      .doc(docId)
      .set({
        data: data,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });  // Merge option prevents overwriting of other fields

    console.log("Document written/updated with ID: ", docId);
  } catch (error) {
    console.error("Error adding or updating document: ", error);
  }
}


exports.webhook = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      const rawBody = req.rawBody;

      if (!rawBody) {
        res.status(400).send('Bad Request');
        return;
      }

      const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
      const hmac = crypto.createHmac('sha256', secret);
      const digest = Buffer.from(hmac.update(rawBody.toString()).digest('hex'), 'hex');

      if (!req.headers['x-signature']) {
        res.status(401).send('Signature missing');
        return;
      }

      const signature = Buffer.from(req.headers['x-signature'], 'hex');

      if (!crypto.timingSafeEqual(digest, signature)) {
        res.status(401).send('Invalid signature');
        return;
      }

      const data = JSON.parse(rawBody)
      if (data.meta.event_name === 'subscription_updated') {
        const subscriptionData = data.data.attributes
        const subscriptionStatus = subscriptionData.status;
        const userId = data.meta.custom_data.user_id;
        const docId = data.meta.event_name; // Use the event name as the document id
        if (subscriptionStatus !== 'expired' && subscriptionStatus !== 'unpaid') {
          await db.collection('users').doc(userId).update({
            subscriber: true,
          });
        } else {
          await db.collection('users').doc(userId).update({
            subscriber: false,
          });
        }
        await saveWebhookData(userId, docId, subscriptionData);
      } else {
        const subscriptionData = data.data.attributes
        const userId = data.meta.custom_data.user_id;
        const docId = data.meta.event_name; // Use the event name as the document id
        await saveWebhookData(userId, docId, subscriptionData);
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Unexpected error occurred:', error);
      res.status(500).send('Internal Server Error');
    }
  });
})