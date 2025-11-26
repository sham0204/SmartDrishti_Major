import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../lib/prisma";
import { requireUser, createAuthErrorResponse } from "../../../lib/auth";
import { validateFields, validationRules } from "../../../lib/validation";
import { withGeneralRateLimit } from "../../../lib/rateLimitMiddleware";

// GET /api/user - Get current user profile
export const GET = withGeneralRateLimit(async () => {
  try {
    const user = await requireUser();
    
    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    if (error.status === 401) {
      return createAuthErrorResponse(error.message, error.status);
    }
    
    console.error("Error fetching user profile:", error);
    return createAuthErrorResponse("Failed to fetch user profile", 500);
  }
});

// PUT /api/user - Update user profile
export const PUT = withGeneralRateLimit(async (request) => {
  try {
    const currentUser = await requireUser();
    
    const data = await request.json();
    
    // Validate input
    const validationRulesObj = {
      name: [validationRules.minLength(2, "Name")],
      email: [validationRules.email()]
    };
    
    const errors = validateFields(data, validationRulesObj);
    if (errors) {
      return NextResponse.json({ errors }, { status: 400 });
    }
    
    // Check if email is already taken by another user
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: currentUser.id }
        }
      });
      
      if (existingUser) {
        return createAuthErrorResponse("Email is already taken", 409);
      }
    }
    
    // Update user
    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: data.name || currentUser.name,
        email: data.email || currentUser.email
      }
    });
    
    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      message: "Profile updated successfully"
    });
  } catch (error) {
    if (error.status === 401) {
      return createAuthErrorResponse(error.message, error.status);
    }
    
    console.error("Error updating user profile:", error);
    return createAuthErrorResponse("Failed to update profile", 500);
  }
});

// PUT /api/user/password - Change password
export const PATCH = withGeneralRateLimit(async (request) => {
  try {
    const currentUser = await requireUser();
    
    const data = await request.json();
    
    // Validate input
    const validationRulesObj = {
      currentPassword: [validationRules.required("Current Password")],
      newPassword: [validationRules.required("New Password"), validationRules.minLength(6, "New Password")]
    };
    
    const errors = validateFields(data, validationRulesObj);
    if (errors) {
      return NextResponse.json({ errors }, { status: 400 });
    }
    
    // Verify current password
    const valid = await bcrypt.compare(data.currentPassword, currentUser.passwordHash);
    if (!valid) {
      return createAuthErrorResponse("Current password is incorrect", 400);
    }
    
    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.newPassword, saltRounds);
    
    // Update password
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { passwordHash }
    });
    
    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    if (error.status === 401) {
      return createAuthErrorResponse(error.message, error.status);
    }
    
    console.error("Error changing password:", error);
    return createAuthErrorResponse("Failed to change password", 500);
  }
});