"use server";

import { adminDb } from "@/lib/firebase/admin";
import { verifyServerSession } from "./auth";
import { revalidatePath } from "next/cache";

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Cria uma nova turma e adiciona o criador como Representante na coleção classMembers
 */
export async function createClass(data: { name: string; university: string; semester: string }) {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  const newClassRef = adminDb.collection("classes").doc();
  const inviteCode = generateInviteCode();

  await newClassRef.set({
    name: data.name,
    university: data.university,
    semester: data.semester,
    code: inviteCode,
    createdAt: new Date().toISOString()
  });

  // Criar relação NxN manualmente no NoSQL
  await adminDb.collection("classMembers").add({
    userId: decoded.uid,
    classId: newClassRef.id,
    role: "rep"
  });

  revalidatePath("/classes");
  return { success: true, classId: newClassRef.id, code: inviteCode };
}

/**
 * Entra em uma turma existente usando o código de convite
 */
export async function joinClass(code: string) {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  // Buscar classe pelo código
  const classSnapshot = await adminDb.collection("classes").where("code", "==", code).limit(1).get();
  
  if (classSnapshot.empty) {
    throw new Error("Código inválido");
  }

  const targetClassId = classSnapshot.docs[0].id;

  // Verificar se já é membro
  const memberCheck = await adminDb.collection("classMembers")
    .where("userId", "==", decoded.uid)
    .where("classId", "==", targetClassId)
    .get();

  if (!memberCheck.empty) {
    return { success: false, message: "Você já está nesta turma." };
  }

  // Associar o usuário à turma
  await adminDb.collection("classMembers").add({
    userId: decoded.uid,
    classId: targetClassId,
    role: "student"
  });

  revalidatePath("/classes");
  return { success: true, classId: targetClassId };
}
