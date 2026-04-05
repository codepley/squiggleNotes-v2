import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protect /notes and all sub-routes, and /revision and all sub-routes
  matcher: ["/notes/:path*", "/revision/:path*"],
};
