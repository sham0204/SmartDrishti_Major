import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAuthErrorResponse } from "@/lib/auth";
import { withAuthRateLimit } from "@/lib/rateLimitMiddleware";

// Force dynamic rendering for API routes that use Prisma
export const dynamic = "force-dynamic";

export const POST = withAuthRateLimit(async (request) => {
  try {
    const { name, username, email, password } = await request.json();
    
    // Validate input
    if (!name || !username || !email || !password) {
      return createAuthErrorResponse("All fields are required.", 400);
    }
    
    if (password.length < 6) {
      return createAuthErrorResponse("Password must be at least 6 characters.", 400);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createAuthErrorResponse("Invalid email format.", 400);
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });
    
    if (existingUser) {
      return createAuthErrorResponse("Username or email already exists.", 409);
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        passwordHash,
        role: "USER" // Default role
      }
    });
    
    // Create user projects
    const projects = await prisma.project.findMany();
    const userProjects = await Promise.all(
      projects.map(project =>
        prisma.userProject.create({
          data: {
            userId: user.id,
            projectId: project.id,
            status: "NOT_STARTED"
          }
        })
      )
    );
    
    return NextResponse.json({ 
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return createAuthErrorResponse("Unexpected error during registration.", 500);
  }
});