import type { ReactElement } from "react";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const EMAIL_FROM = `CREOLE PSF <${process.env.GMAIL_USER}>`;

export async function sendMail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: ReactElement;
}): Promise<{ error: { message: string } | null }> {
  try {
    const html = await render(react);
    await transporter.sendMail({ from: EMAIL_FROM, to, subject, html });
    return { error: null };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

export function getAppUrl() {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
