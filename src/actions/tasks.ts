"use server";

import { adminDb } from "@/lib/firebase/admin";
import { verifyServerSession } from "./auth";
import { revalidatePath } from "next/cache";

export async function createTask(data: { title: string; description?: string; dueDate?: Date; subjectId?: string }) {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  const taskData = {
    title: data.title,
    description: data.description || null,
    dueDate: data.dueDate ? data.dueDate.toISOString() : null,
    subjectId: data.subjectId || null,
    userId: decoded.uid,
    completed: false,
    xpReward: 10,
    createdAt: new Date().toISOString(),
  };

  const docRef = await adminDb.collection("tasks").add(taskData);

  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return { success: true, taskId: docRef.id };
}

export async function deleteTask(taskId: string) {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  const docRef = adminDb.collection("tasks").doc(taskId);
  const docSnap = await docRef.get();
  
  if (!docSnap.exists || docSnap.data()?.userId !== decoded.uid) {
    throw new Error("Unauthorized or not found");
  }

  await docRef.delete();

  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return { success: true };
}
