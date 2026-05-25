import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return new NextResponse("Admin access is not configured.", {
      status: 403,
    });
  }

  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Basic ")) {
    const credentials = atob(authorization.slice("Basic ".length));
    const separatorIndex = credentials.indexOf(":");
    const password =
      separatorIndex === -1 ? "" : credentials.slice(separatorIndex + 1);

    if (password === adminPassword) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    headers: {
      "WWW-Authenticate": 'Basic realm="WatchComparisonAI Admin"',
    },
    status: 401,
  });
}

export const config = {
  matcher: "/admin/:path*",
};
