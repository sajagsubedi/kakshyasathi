import { auth } from "@/lib/auth";
import { roleDashboardPath } from "@/lib/routes";
import { UserRole } from "@/types";
import { NextResponse } from "next/server";

const publicPaths = [
  "/signin",
  "/api/auth",
  "/api/attendanceterminal",
  "/setup",
];

const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isAuthenticated = !!req.auth;
  const role = req.auth?.user?.role;

  if (!isAuthenticated) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const rolePrefixes = [
    { prefix: "/admin", roles: [UserRole.admin] },
    { prefix: "/teacher", roles: [UserRole.teacher] },
    { prefix: "/student", roles: [UserRole.student] },
    { prefix: "/smartboard", roles: ["smartboard"] },
  ];

  for (const { prefix, roles } of rolePrefixes) {
    if (pathname.startsWith(prefix) && role && !roles.includes(role)) {
      return NextResponse.redirect(new URL(roleDashboardPath(role), req.url));
    }
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(role ? roleDashboardPath(role) : "/signin", req.url),
    );
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|logo|manifest).*)",
  ],
};
