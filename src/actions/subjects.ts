"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { verifyServerSession } from "./auth";
import { revalidatePath } from "next/cache";

export interface Subject {
  id: string;
  name: string;
  days: string[];
  color?: string;
}

/**
 * Busca as matérias do usuário logado
 */
export async function getSubjects() {
  const session = await verifyServerSession();
  if (!session) return { success: false, subjects: [] };

  const adminDb = getAdminDb();
  if (!adminDb) return { success: false, subjects: [] };

  try {
    const userDoc = await adminDb.collection("users").doc(session.uid).get();
    if (!userDoc.exists) return { success: false, subjects: [] };

    const data = userDoc.data();
    return { success: true, subjects: (data?.subjects || []) as Subject[] };
  } catch (error) {
    console.error("Error getting subjects:", error);
    return { success: false, subjects: [] };
  }
}

/**
 * Atualiza todas as matérias do usuário
 */
export async function updateUserSubjects(subjects: Subject[]) {
  const session = await verifyServerSession();
  if (!session) throw new Error("Unauthorized");

  const adminDb = getAdminDb();
  if (!adminDb) return { success: false, error: "BD indisponível" };

  try {
    await adminDb.collection("users").doc(session.uid).update({
      subjects: subjects
    });
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating subjects:", error);
    return { success: false, error: "Falha ao salvar matérias" };
  }
}

/**
 * Adiciona uma única matéria
 */
export async function addSubject(subject: Omit<Subject, "id">) {
  const session = await verifyServerSession();
  if (!session) throw new Error("Unauthorized");

  const adminDb = getAdminDb();
  if (!adminDb) return { success: false };

  const newSubject: Subject = {
    ...subject,
    id: Math.random().toString(36).substring(2, 9)
  };

  try {
    const userRef = adminDb.collection("users").doc(session.uid);
    const userDoc = await userRef.get();
    const currentSubjects = userDoc.data()?.subjects || [];
    
    await userRef.update({
      subjects: [...currentSubjects, newSubject]
    });

    revalidatePath("/calendar");
    return { success: true, subject: newSubject };
  } catch (error) {
    console.error("Error adding subject:", error);
    return { success: false };
  }
}
