import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env["SENDGRID_API"]!);

interface SendMailParams {
  to: string;
  subject?: string;
  text?: string;
  html?: string;
}
export const sendMail = async (props: SendMailParams) => {
  const { to, ...restProps } = props;
  const message = {
    to: to,
    from: process.env["SENDER_EMAIL"]!,
    text: '',
    ...restProps
  };

  return sgMail.send(message);
}