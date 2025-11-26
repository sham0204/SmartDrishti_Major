import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { requireUser, requireAdmin, createAuthErrorResponse } from "../../../lib/auth";
import { validateFields, validationRules } from "../../../lib/validation";
import { withGeneralRateLimit } from "../../../lib/rateLimitMiddleware";

// GET /api/project - Get all projects
export const GET = withGeneralRateLimit(async () => {
  try {
    // Anyone can view projects
    const projects = await prisma.project.findMany({
      orderBy: { id: "asc" }
    });
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return createAuthErrorResponse("Failed to fetch projects", 500);
  }
});

// POST /api/project - Create a new project (admin only)
export const POST = withGeneralRateLimit(async (request) => {
  try {
    const user = await requireAdmin();
    
    const data = await request.json();
    
    // Validate input
    const validationRulesObj = {
      key: [validationRules.required("Project Key"), validationRules.minLength(3, "Project Key")],
      title: [validationRules.required("Title"), validationRules.minLength(3, "Title")],
      shortDescription: [validationRules.required("Short Description"), validationRules.minLength(10, "Short Description")]
    };
    
    const errors = validateFields(data, validationRulesObj);
    if (errors) {
      return NextResponse.json({ errors }, { status: 400 });
    }
    
    // Create project
    const project = await prisma.project.create({
      data: {
        key: data.key,
        title: data.title,
        shortDescription: data.shortDescription
      }
    });
    
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      return createAuthErrorResponse(error.message, error.status);
    }
    
    console.error("Error creating project:", error);
    return createAuthErrorResponse("Failed to create project", 500);
  }
});