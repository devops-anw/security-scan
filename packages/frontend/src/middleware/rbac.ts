import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasRole } from "@/lib/auth";
import { UserRole } from "@/types/auth";

interface RBACRule {
  path: RegExp;
  methods: string[];
  roles: UserRole[];
  checkFunction?: (
    request: NextRequest,
    userId: string,
    userOrg: string
  ) => boolean;
}

const rbacRules: RBACRule[] = [
  {
    path: /^\/api\/users\/pending$/,
    methods: ["GET"],
    roles: [UserRole.PLATFORM_ADMIN],
  },
  {
    path: /^\/api\/users\/[^/]+\/approve$/,
    methods: ["POST"],
    roles: [UserRole.PLATFORM_ADMIN],
  },
  {
    path: /^\/api\/users\/[^/]+\/reject$/,
    methods: ["POST"],
    roles: [UserRole.PLATFORM_ADMIN],
  },
  {
    path: /^\/api\/users\/[^/]+$/,
    methods: ["GET", "PUT", "DELETE"],
    roles: [UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN],
    checkFunction: (request, userId, userOrg) => {
      const pathUserId = request.nextUrl.pathname.split("/").pop();
      if (
        request.headers.get("X-User-Roles")?.includes(UserRole.PLATFORM_ADMIN)
      ) {
        return true; // PLATFORM_ADMIN can access all users
      }
      // ORG_ADMIN can only access their own user info or users in their org
      return (
        userId === pathUserId || userOrg === request.headers.get("X-User-Org")
      );
    },
  },
  {
    path: /^\/api\/users$/,
    methods: ["GET"],
    roles: [UserRole.PLATFORM_ADMIN],
  },
  // Add more rules as needed
];

export function rbacMiddleware(
  request: NextRequest,
  authResponse: NextResponse
) {
  const path = request.nextUrl.pathname;
  const method = request.method;
  const userRolesString = authResponse.headers.get("X-User-Roles");
  const userRoles = userRolesString
    ? (JSON.parse(userRolesString) as UserRole[])
    : [];
  const userId = authResponse.headers.get("X-User-ID");
  const userOrg = authResponse.headers.get("X-User-Org");

  if (!userRoles.length || !userId || !userOrg) {
    return NextResponse.json({ error: "User information not found" }, {
      status: 403,
    } as any);
  }

  // Check if the path is missing a user ID
  if (
    /^\/api\/users\/approve$/.test(path) ||
    /^\/api\/users\/reject$/.test(path)
  ) {
    return NextResponse.json(
      {
        error: "User ID is required",
        details: [
          {
            field: "userId",
            message: "A valid user ID must be provided",
          },
        ],
      },
      { status: 400 }
    );
  }

  const matchingRule = rbacRules.find(
    (rule) =>
      rule.path.test(path) &&
      rule.methods.includes(method) &&
      hasRole(rule.roles, userRoles)
  );

  if (!matchingRule) {
    return NextResponse.json({ error: "Insufficient permissions" }, {
      status: 403,
    } as any);
  }

  // If there's a check function, run it
  if (
    matchingRule.checkFunction &&
    !matchingRule.checkFunction(request, userId, userOrg)
  ) {
    return NextResponse.json({ error: "Insufficient permissions" }, {
      status: 403,
    } as any);
  }

  return authResponse;
}
