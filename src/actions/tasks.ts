"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { verifyServerSession } from "./auth";
import { revalidatePath } from "next/cache";
import { addXP } from "./gamification";

export async function createTask(data: { title: string; description?: string; dueDate?: Date; subjectId?: string; status?: string }) {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  const adminDb = getAdminDb();
  if (!adminDb) {
    console.error("createTask: adminDb não inicializado");
    return { success: false, message: "Banco de dados indisponível." };
  }

  const taskData = {
    title: data.title,
    description: data.description || null,
    dueDate: data.dueDate ? data.dueDate.toISOString() : null,
    subjectId: data.subjectId || null,
    userId: decoded.uid,
    status: data.status || "todo",
    completed: false, // Mantido para compatibilidade legado se necessário
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

  const adminDb = getAdminDb();
  if (!adminDb) {
    console.error("deleteTask: adminDb não inicializado");
    return { success: false, message: "Banco de dados indisponível." };
  }

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

export async function updateTaskStatus(taskId: string, status: string) {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  const adminDb = getAdminDb();
  if (!adminDb) return { success: false, message: "BD indisponível" };

  const docRef = adminDb.collection("tasks").doc(taskId);
  const docSnap = await docRef.get();
  
  if (!docSnap.exists || docSnap.data()?.userId !== decoded.uid) {
    throw new Error("Unauthorized or not found");
  }

  const oldStatus = docSnap.data()?.status;
  const completed = status === "done";
  
  await docRef.update({ 
    status, 
    completed,
    updatedAt: new Date().toISOString() 
  });

  // Se foi recém concluída, ganha XP
  if (completed && oldStatus !== "done") {
    await addXP(docSnap.data()?.xpReward || 10);
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTask(taskId: string, updates: Partial<{ title: string; description: string; dueDate: Date | string; subjectId: string; status: string }>) {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  const adminDb = getAdminDb();
  if (!adminDb) return { success: false, message: "BD indisponível" };

  const docRef = adminDb.collection("tasks").doc(taskId);
  const docSnap = await docRef.get();
  
  if (!docSnap.exists || docSnap.data()?.userId !== decoded.uid) {
    throw new Error("Unauthorized or not found");
  }

  const updateData: any = { ...updates };
  
  // Tratar conversão de data se necessário
  if (updates.dueDate instanceof Date) {
    updateData.dueDate = updates.dueDate.toISOString();
  }
  
  // Sincronizar campo completed para legado
  if (updates.status) {
    updateData.completed = updates.status === "done";
  }

  const oldStatus = docSnap.data()?.status;
  await docRef.update(updateData);

  // Se o status mudou para 'done', ganha XP
  if (updateData.status === "done" && oldStatus !== "done") {
    await addXP(docSnap.data()?.xpReward || 10);
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}
