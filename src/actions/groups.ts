"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { verifyServerSession } from "./auth";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Cria uma guilda dentro de uma turma (ou independente)
 */
export async function createGroup(data: { name: string; classId?: string }) {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  const adminDb = getAdminDb();
  if (!adminDb) {
    console.error("createGroup: adminDb não inicializado");
    return { success: false, message: "Banco de dados indisponível." };
  }

  const newGroupRef = adminDb.collection("groups").doc();

  await newGroupRef.set({
    name: data.name,
    classId: data.classId || null,
    membersIds: [decoded.uid],
    createdAt: new Date().toISOString()
  });

  revalidatePath("/classes");
  if (data.classId) {
    revalidatePath(`/classes/${data.classId}`);
  }

  return { success: true, groupId: newGroupRef.id };
}

/**
 * Junta-se a uma guilda existente
 */
export async function joinGroup(groupId: string) {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  const adminDb = getAdminDb();
  if (!adminDb) {
    console.error("joinGroup: adminDb não inicializado");
    return { success: false, message: "Banco de dados indisponível." };
  }

  const groupRef = adminDb.collection("groups").doc(groupId);
  const groupSnap = await groupRef.get();

  if (!groupSnap.exists) {
    throw new Error("Guilda não existe");
  }

  const groupData = groupSnap.data();
  if (groupData?.membersIds?.includes(decoded.uid)) {
    return { success: false, message: "Já é membro desta guilda." };
  }

  await groupRef.update({
    membersIds: FieldValue.arrayUnion(decoded.uid)
  });

  revalidatePath("/classes");
  return { success: true };
}
