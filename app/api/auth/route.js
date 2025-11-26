import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, signJwt, TOKEN_COOKIE, createAuthErrorResponse } from "@/lib/auth";
import { withAuthRateLimit } from "@/lib/rateLimitMiddleware";

// Force dynamic rendering for API routes that use Prisma
export const dynamic = "force-dynamic";

// GET /api/auth - Check if user is authenticated
export const GET = withAuthRateLimit(async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createAuthErrorResponse("Unauthorized", 401);
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth GET error:", error);
    return createAuthErrorResponse("Internal server error", 500);
  }
});

// POST /api/auth - Login user
export const POST = withAuthRateLimit(async (request) => {
  try {
    const { username, password } = await request.json();
    
    // Validate input
    if (!username || !password) {
      return createAuthErrorResponse("Username and password are required.", 400);
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    // If user not found, return generic error to prevent username enumeration
    if (!user) {
      return createAuthErrorResponse("Invalid username or password.", 401);
    }

    // Compare provided password with stored hash
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return createAuthErrorResponse("Invalid username or password.", 401);
    }

    // Create JWT token
    const token = signJwt({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    // Create response with user data
    const response = NextResponse.json({ 
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
    
    // Set auth cookie
    response.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return createAuthErrorResponse("Unexpected error during login.", 500);
  }
});

// DELETE /api/auth - Logout user
export const DELETE = withAuthRateLimit(async () => {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" });
    response.cookies.set(TOKEN_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/"
    });
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return createAuthErrorResponse("Unexpected error during logout.", 500);
  }
});