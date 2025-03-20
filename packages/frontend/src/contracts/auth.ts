import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const contract = c.router({
  signup: {
    method: "POST",
    path: "/api/auth/signup",
    body: z.object({
      orgName: z.string().min(1, "Organization name is required"),
      adminUser: z.object({
        username: z.string().min(1, "Username is required"),
        email: z
          .string()
          .email("Invalid email format")
          .min(1, "Email is required"),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        password: z.string().min(1, "Password is required"),
      }),
    }),
    responses: {
      201: z.object({
        tenant: z.object({
          id: z.string(),
          name: z.string(),
        }),
        adminUser: z.object({
          id: z.string(),
          username: z.string(),
          email: z.string(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          enabled: z.boolean(),
          attributes: z.record(z.any()),
        }),
      }),
      400: z.object({
        error: z.string(),
        code: z.enum(["USER_EXISTS", "INVALID_INPUT", "MISSING_PARAMETER","OTHER"]),
        details: z
          .array(
            z.object({
              field: z.string(),
              message: z.string(),
            })
          )
          .optional(),
      }),
    },
  },
  verifyEmail: {
    method: "POST",
    path: "/api/auth/verify-email",
    body: z.object({
      token: z.string().min(1, "Verification token is required"),
    }),
    responses: {
      200: z.object({
        message: z.string(),
      }),
      400: z.object({
        error: z.string(),
        code: z.enum(["INVALID_TOKEN", "EXPIRED_TOKEN", "MISSING_TOKEN"]),
        details: z
          .array(
            z.object({
              field: z.string(),
              message: z.string(),
            })
          )
          .optional(),
        }),
      500: z.object({
        error: z.string(),
      }),
    },
  },
  approveUser: {
    method: "POST",
    path: "/api/users/[userId]/approve",
    pathParams: z.object({
      Id: z.string().min(1, "User ID is required"),
    }),
    body: z.object({}),
    responses: {
      200: z.object({
        message: z.string(),
      }),
      400: z.object({
        error: z.string(),
        details: z.array(
          z.object({
            field: z.string(),
            message: z.string(),
          })
        ).optional(),
      }),
      500: z.object({
        error: z.string(),
      }),
    },
  },
  rejectUser: {
    method: "POST",
    path: `/api/users/[userId]/reject`,
    pathParams: z.object({
      userId: z.string().min(1, "User ID is required"),
    }),
    body: z.object({}),
    responses: {
      200: z.object({
        message: z.string(),
      }),
      400: z.object({
        error: z.string(),
        details: z.array(
          z.object({
            field: z.string(),
            message: z.string(),
          })
        ).optional(),
      }),
      500: z.object({
        error: z.string(),
      }),
    },
  },
  pendingUsers: {
    method: "GET",
    path: "/api/users/pending",
    responses: {
      200: z.array(
        z.object({
          id: z.string(),
          username: z.string(),
          email: z.string(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          enabled: z.boolean(),
          attributes: z.record(z.any()),
        })
      ),
    },
  },
  updateUser: {
    method: "PUT",
    path: "/api/users/[userId]",
    body: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    }),
    responses: {
      200: z.object({
        id: z.string(),
        username: z.string(),
        email: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        enabled: z.boolean(),
        attributes: z.record(z.any()),
      }),
      400: z.object({
        error: z.string(),
      }),
      500: z.object({
        error: z.string(),
      }),
    },
  },
  getUser: {
    method: "GET",
    path: "/api/users/[userId]",
    responses: {
      200: z.object({
        id: z.string(),
        username: z.string(),
        email: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        enabled: z.boolean(),
        attributes: z.record(z.any()),
      }),
      400: z.object({
        error: z.string(),
      }),
      500: z.object({
        error: z.string(),
      }),
    },
  },
});
