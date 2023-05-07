import {  sendSignInLinkToEmail, ActionCodeSettings } from 'firebase/auth';
import {auth} from "../firebase"

const actionCodeSettings = {
  url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/email-link-handler`,
  handleCodeInApp: true,
};

export async function sendEmailLink(email) {
  // const auth = getAuth();
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
}
