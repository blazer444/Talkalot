import {Resend} from 'resend';
import {ENV} from "./env.js";

if (!ENV.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is required but not configured');
}

export const resendClient = new Resend(ENV.RESEND_API_KEY);

export const sender = {
    email: ENV.EMAIL_FROM,
    name: ENV.EMAIL_FROM_NAME,
};