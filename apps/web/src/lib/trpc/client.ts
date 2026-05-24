"use client";

import { createTRPCReact } from "@trpc/react-query";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRouter = any;
export const api = createTRPCReact<AnyRouter>();
