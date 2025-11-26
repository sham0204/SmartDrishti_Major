import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "./prisma";

export const TOKEN_COOKIE = "sd_token";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

export const signJwt = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload for JWT signing");
  }
  
  // Validate required fields
  if (!payload.userId || !payload.username) {
    throw new Error("Missing required fields in payload");
  }
  
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
};

export const verifyJwt = (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }
  
  try {
    return jwt.verify(token, getSecret());
  } catch (error) {
    console.warn("JWT verification failed:", error.message);
    return null;
  }
};

export const getCurrentUser = async () => {
  try {
    const token = cookies().get(TOKEN_COOKIE)?.value;
    if (!token) return null;
    
    const decoded = verifyJwt(token);
    if (!decoded || !decoded.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) return null;
    
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export const requireUser = async () => {
  const user = await getCurrentUser();
  if (!user) {
    const error = new Error("Authentication required");
    error.status = 401;
    throw error;
  }
  return user;
};

export const requireAdmin = async () => {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    const error = new Error("Admin access required");
    error.status = 403;
    throw error;
  }
  return user;
};

// Helper function to create a proper response for auth errors
export const createAuthErrorResponse = (message, status = 401) => {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { "Content-Type": "application/json" }
    }
  );
};