/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminAccess from "../adminAccess.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as authCredentialsHelpers from "../authCredentialsHelpers.js";
import type * as files from "../files.js";
import type * as furnitureListings from "../furnitureListings.js";
import type * as http from "../http.js";
import type * as inquiries from "../inquiries.js";
import type * as seed from "../seed.js";
import type * as siteSettings from "../siteSettings.js";
import type * as team from "../team.js";
import type * as uploads from "../uploads.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminAccess: typeof adminAccess;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  authCredentialsHelpers: typeof authCredentialsHelpers;
  files: typeof files;
  furnitureListings: typeof furnitureListings;
  http: typeof http;
  inquiries: typeof inquiries;
  seed: typeof seed;
  siteSettings: typeof siteSettings;
  team: typeof team;
  uploads: typeof uploads;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
