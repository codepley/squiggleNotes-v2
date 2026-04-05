import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

// Next.js App Router expects GET and POST exports for the route handler
export { handler as GET, handler as POST };
