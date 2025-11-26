import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { requireUser, requireAdmin, createAuthErrorResponse } from "../../../../lib/auth";
import { validateFields, validationRules } from "../../../../lib/validation";
import { withGeneralRateLimit } from "../../../../lib/rateLimitMiddleware";

// GET /api/project/[id] - Get a specific project
export const GET = withGeneralRateLimit(async (request, { params }) => {
  try {
    // Anyone can view a project
    const projectId = parseInt(params.id);
    
    if (isNaN(projectId)) {
      return createAuthErrorResponse("Invalid project ID", 400);
    }
    
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!project) {
      return createAuthErrorResponse("Project not found", 404);
    }
    
    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return createAuthErrorResponse("Failed to fetch project", 500);
  }
});

// PUT /api/project/[id] - Update a project (admin only)
export const PUT = withGeneralRateLimit(async (request, { params }) => {
  try {
    const user = await requireAdmin();
    
    const projectId = parseInt(params.id);
    
    if (isNaN(projectId)) {
      return createAuthErrorResponse("Invalid project ID", 400);
    }
    
    const data = await request.json();
    
    // Validate input
    const validationRulesObj = {
      title: [validationRules.minLength(3, "Title")],
      shortDescription: [validationRules.minLength(10, "Short Description")]
    };
    
    const errors = validateFields(data, validationRulesObj);
    if (errors) {
      return NextResponse.json({ errors }, { status: 400 });
    }
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!existingProject) {
      return createAuthErrorResponse("Project not found", 404);
    }
    
    // Update project
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        title: data.title || existingProject.title,
        shortDescription: data.shortDescription || existingProject.shortDescription
      }
    });
    
    return NextResponse.json({ project });
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      return createAuthErrorResponse(error.message, error.status);
    }
    
    console.error("Error updating project:", error);
    return createAuthErrorResponse("Failed to update project", 500);
  }
});

// DELETE /api/project/[id] - Delete a project (admin only)
export const DELETE = withGeneralRateLimit(async (request, { params }) => {
  try {
    const user = await requireAdmin();
    
    const projectId = parseInt(params.id);
    
    if (isNaN(projectId)) {
      return createAuthErrorResponse("Invalid project ID", 400);
    }
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!existingProject) {
      return createAuthErrorResponse("Project not found", 404);
    }
    
    // Delete project (this will cascade delete related records)
    await prisma.project.delete({
      where: { id: projectId }
    });
    
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      return createAuthErrorResponse(error.message, error.status);
    }
    
    console.error("Error deleting project:", error);
    return createAuthErrorResponse("Failed to delete project", 500);
  }
});