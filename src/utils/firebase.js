import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, getDocs, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export const saveStackHistory = async (stack) => {
  const myStack = collection(db, "myStack");

  try {
    const docRef = await addDoc(myStack, {
      stackName: stack.title,
      timestamp: new Date(),
    });

    console.log("Document written with ID: ", docRef.id);

    const subStacks = collection(docRef, "subStacks");
    const stackContentRef = await addDoc(subStacks, {
      stack: stack,
      timestamp: new Date(),
    });

    console.log("Document written with ID: ", stackContentRef.id);


    // Return the Id's for later use
    return { stackId: docRef.id, subStackId: stackContentRef.id };

  } catch (error) {
    console.error("Error adding document: ", error);
  }
}

export const saveSubStack = async (stackId, subStack) => {
  const myStackRef = doc(db, "myStack", stackId);
  const subStacksCollection = collection(myStackRef, "subStacks");

  try {
    const subStackRef = await addDoc(subStacksCollection, {
      stack: subStack,
      timestamp: new Date(),
    });

    console.log("Sub-stack document written with ID: ", subStackRef.id);

    return subStackRef.id;
  } catch (error) {
    console.error("Error adding sub-stack document: ", error);
  }
}

export const updateSubStack = async (stackId, subStackId, topic, depthResponseData) => {
  const myStackRef = doc(db, "myStack", stackId);
  const subStacksCollection = collection(myStackRef, "subStacks");
  const subStackRef = doc(subStacksCollection, subStackId);

  try {
    // Fetch existing document
    const docSnapshot = await getDoc(subStackRef);
    if (!docSnapshot.exists()) {
      console.error('No such document exists!');
      return;
    }
    let currentData = docSnapshot.data();

    // If the topic already exists, append to it. Otherwise, create a new array
    if (currentData.depthStack && currentData.depthStack[topic]) {
      currentData.depthStack[topic].push(depthResponseData);
    } else {
      currentData.depthStack = { ...currentData.depthStack, [topic]: [depthResponseData] };
    }

    // Update the document with the new data
    await updateDoc(subStackRef, currentData);

    console.log("Sub-stack document updated with ID: ", subStackRef.id);
  } catch (error) {
    console.error("Error updating sub-stack document: ", error);
  }
}

export const fetchStacks = async () => {
  const myStack = collection(db, "myStack");

  try {
    const snapshot = await getDocs(myStack);
    const stacks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return stacks;
  } catch (error) {
    console.error("Error fetching stacks: ", error);
  }
}

export const fetchSubStacks = async (stackId) => {
  const myStackRef = doc(db, "myStack", stackId);
  const subStacksCollection = collection(myStackRef, "subStacks");

  try {
    const snapshot = await getDocs(subStacksCollection);
    const subStacks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return subStacks;
  } catch (error) {
    console.error("Error fetching sub-stacks: ", error);
  }
}
