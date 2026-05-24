import { getServerSession, type NextAuthOptions } from "next-auth";

export const createGetServerAuthSession = (authOptions: NextAuthOptions) =>
  () => getServerSession(authOptions);
