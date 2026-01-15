"use server";

import { studentService } from "@/backend/services/student";
import { CreateStudentInput } from "@/types/shared/entities/user";
import { revalidatePath } from "next/cache";

export async function createStudentAction(data: CreateStudentInput) {
  try {
    // In a real app, we should validate the user's session/role here
    // For now assuming the page's middleware handles access control

    const newStudent = await studentService.create(data);
    revalidatePath("/admin/alunos");
    return { success: true, data: newStudent };
  } catch (error) {
    console.error("Values error:", error);
    return { success: false, error: (error as Error).message };
  }
}
