import { Resend } from "resend";

// Resend's constructor throws immediately if the key is falsy (unlike the
// Anthropic SDK, which only fails at request time). Falling back to a
// placeholder keeps the module importable — and the build passing — before
// RESEND_API_KEY is configured; sending an email still fails clearly at
// runtime until a real key is set.
export const resend = new Resend(process.env.RESEND_API_KEY || "re_not_configured");

export const EMAIL_FROM = "CREOLE PSF <onboarding@resend.dev>";

export function getAppUrl() {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
