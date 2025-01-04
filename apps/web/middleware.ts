import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define route matchers

const isPublicAuthRoute = createRouteMatcher(["/auth/(.*)"]);

const isPublicLandingRoute = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicAuthRoute(request) && !isPublicLandingRoute(request)) {
    await auth.protect();
  }
});
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
