import Twilio from 'twilio';
const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendSMS = async (to: string, body: string) => {
  return client.messages.create({ to, from: process.env.TWILIO_FROM, body });
};
