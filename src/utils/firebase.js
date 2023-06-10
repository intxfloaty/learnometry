import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, getDocs, getDoc, updateDoc, query, orderBy } from "firebase/firestore";

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
  // Check if user is signed in
  if (auth.currentUser) {
    const userId = auth.currentUser.uid;
    const users = collection(db, "users");
    const userRef = doc(users, userId);
    const myStack = collection(userRef, "myStack");

    try {
      const docRef = await addDoc(myStack, {
        stackName: stack.title,
        timestamp: new Date(),
      });

      console.log("Document written with ID: ", docRef.id);

      const subStacks = collection(docRef, "subStacks");

      // Add the document first to get the ID
      const stackContentRef = await addDoc(subStacks, {
        stack: { ...stack, id: '' },  // Temporary placeholder for ID
        timestamp: new Date(),
      });

      console.log("Document written with ID: ", stackContentRef.id);

      // Update the 'stack' field in the document with its own ID
      await updateDoc(stackContentRef, {
        'stack.id': stackContentRef.id,  // Update the id inside the stack object
      });

      console.log("Sub-stack document updated with its own ID inside the stack object");

      // Return the Id's for later use
      return { stackId: docRef.id, subStackId: stackContentRef.id };

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  } else {
    console.log("No user is signed in.");
  }
}



export const saveSubStack = async (stackId, subStack) => {
  // Check if user is signed in
  if (auth.currentUser) {
    const userId = auth.currentUser.uid;
    const users = collection(db, "users");
    const userRef = doc(users, userId);
    const myStackCollection = collection(userRef, "myStack");
    const myStackRef = doc(myStackCollection, stackId);
    const subStacksCollection = collection(myStackRef, "subStacks");


    try {
      const subStackRef = await addDoc(subStacksCollection, {
        stack: { ...subStack, id: '' },  // Temporary placeholder for ID
        timestamp: new Date(),
      });

      console.log("Sub-stack document written with ID: ", subStackRef.id);

      // Update the document with its own ID
      await updateDoc(subStackRef, {
        'stack.id': subStackRef.id,  // Update the id inside the stack object
      });

      console.log("Sub-stack document updated with its own ID");

      return subStackRef.id;
    } catch (error) {
      console.error("Error adding sub-stack document: ", error);
    }
  } else {
    console.log("No user is signed in or the passed userId doesn't match with the current user.");
  }
}



export const updateSubStack = async (stackId, subStackId, topic, depthResponseData) => {
  // Check if user is signed in
  if (auth.currentUser) {
    const userId = auth.currentUser.uid;
    const users = collection(db, "users");
    const userRef = doc(users, userId);
    const myStackCollection = collection(userRef, "myStack");
    const myStackRef = doc(myStackCollection, stackId);
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
  } else {
    console.log("No user is signed in or the passed userId doesn't match with the current user.");
  }
}


export const fetchStacks = async () => {
  // Check if user is signed in
  if (auth.currentUser) {
    const userId = auth.currentUser.uid;
    const users = collection(db, "users");
    const userRef = doc(users, userId);
    const myStack = collection(userRef, "myStack");

    try {
      const snapshot = await getDocs(query(myStack, orderBy('timestamp')));
      const stacks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return stacks;
    } catch (error) {
      console.error("Error fetching stacks: ", error);
    }
  } else {
    console.log("No user is signed in.");
  }
}


export const fetchSubStacks = async (stackId) => {
  // Check if user is signed in
  if (auth.currentUser) {
    const userId = auth.currentUser.uid;
    const users = collection(db, "users");
    const userRef = doc(users, userId);
    const myStackCollection = collection(userRef, "myStack");
    const myStackRef = doc(myStackCollection, stackId);
    const subStacksCollection = collection(myStackRef, "subStacks");

    try {
      const snapshot = await getDocs(query(subStacksCollection, orderBy('timestamp')));
      const subStacks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return subStacks;
    } catch (error) {
      console.error("Error fetching sub-stacks: ", error);
    }
  } else {
    console.log("No user is signed in.");
  }
}

// to check if user is a non-subscriber and responseCount is not zero
export const checkUserResponseCount = async () => {
  if (auth.currentUser) {
    const userId = auth.currentUser.uid;
    const users = collection(db, "users");
    const userRef = doc(users, userId);

    try {
      const docSnapshot = await getDoc(userRef);
      if (!docSnapshot.exists()) {
        console.error('No such document exists!');
        return;
      }
      let currentData = docSnapshot.data();
      return {responseCount: currentData.responseCount, subscriber: currentData.subscriber};
    } catch (error) {
      console.error("Error fetching user response count: ", error);
    }
  } else {
    console.log("No user is signed in.");
  }
}

