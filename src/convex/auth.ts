// THIS FILE IS READ ONLY. Do not touch this file unless you are correctly
// adding a new auth provider in accordance to the vly auth documentation.
//
// Credentials login: users sign in with email OR username + password.
// Sign-up requires an email (for account recovery and order contact) plus an
// optional unique username. Passwords are hashed with Scrypt (Lucia), the
// same scheme the official `Password` provider uses.

import { convexAuth } from "@convex-dev/auth/server";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { Scrypt } from "lucia";
import { internal } from "./_generated/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalize the identifier: lowercase; strip mailto-ish whitespace. */
function normalizeIdentifier(raw: string): string {
  return raw.trim().toLowerCase();
}

function validatePasswordRequirements(password: string) {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
}

function validateUsername(username: string) {
  if (!/^[a-z0-9_.-]{3,24}$/.test(username)) {
    throw new Error(
      "Username must be 3–24 characters: letters, numbers, dots, dashes or underscores.",
    );
  }
}

function isEmail(identifier: string): boolean {
  return EMAIL_RE.test(identifier);
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    ConvexCredentials({
      id: "credentials",
      authorize: async (params, ctx) => {
        const flow = params.flow;
        if (flow !== "signUp" && flow !== "signIn") {
          throw new Error("Unsupported sign-in flow.");
        }

        const password = params.password;
        if (typeof password !== "string" || password.length === 0) {
          throw new Error("Password is required.");
        }

        const identifier = normalizeIdentifier(
          typeof params.identifier === "string" ? params.identifier : "",
        );
        if (!identifier) {
          throw new Error("Enter your email or username.");
        }

        const secret = password;

        if (flow === "signUp") {
          validatePasswordRequirements(password);

          // Sign-up always creates a real email-backed account.
          const email = identifier;
          if (!isEmail(email)) {
            throw new Error(
              "Sign-up needs a valid email address (usernames are for signing in).",
            );
          }

          // Optional username, claimed at sign-up.
          const rawUsername =
            typeof params.username === "string" ? params.username.trim() : "";
          let username: string | undefined;
          if (rawUsername) {
            username = normalizeIdentifier(rawUsername);
            validateUsername(username);
            const taken = await ctx.runQuery(
              internal.authCredentialsHelpers.findByUsername,
              { username },
            );
            if (taken) {
              throw new Error("That username is already taken.");
            }
          }

          const profile: {
            email: string;
            name?: string;
            username?: string;
          } = { email };
          const rawName = typeof params.name === "string" ? params.name.trim() : "";
          if (rawName) profile.name = rawName;
          if (username) profile.username = username;

          const { user } = await createAccount(ctx, {
            provider: "credentials",
            account: { id: email, secret },
            profile,
            shouldLinkViaEmail: false,
            shouldLinkViaPhone: false,
          });
          return { userId: user._id };
        }

        // flow === "signIn": identifier may be an email OR a username.
        let email: string | null = null;
        if (isEmail(identifier)) {
          email = identifier;
        } else {
          validateUsername(identifier);
          const found = await ctx.runQuery(
            internal.authCredentialsHelpers.findByUsername,
            { username: identifier },
          );
          if (!found?.email) {
            // Same message for unknown user and missing email to avoid
            // leaking which accounts exist.
            throw new Error("Invalid email/username or password.");
          }
          email = found.email;
        }

        const retrieved = await retrieveAccount(ctx, {
          provider: "credentials",
          account: { id: email, secret },
        });
        if (retrieved === null) {
          throw new Error("Invalid email/username or password.");
        }
        return { userId: retrieved.user._id };
      },
      crypto: {
        async hashSecret(password) {
          return await new Scrypt().hash(password);
        },
        async verifySecret(password, hash) {
          return await new Scrypt().verify(hash, password);
        },
      },
    }),
    Anonymous,
  ],
});
