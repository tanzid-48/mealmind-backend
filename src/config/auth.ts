import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.CLIENT_URL as string],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
  advanced: {
    // Frontend (vercel.app) and backend (onrender.com) are different domains,
    // not subdomains of the same root — cookies used during the OAuth redirect
    // (like the state cookie) need SameSite=None + Secure to survive that
    // cross-site round trip. Without this, Google login fails with state_mismatch.
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
});
