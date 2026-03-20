"use server";

import { adminDb } from "@/lib/firebase/admin";
import { verifyServerSession } from "./auth";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Adiciona XP ao usuário e verifica se ele subiu de nível.
 */
export async function addXP(amount: number) {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  const userRef = adminDb.collection("users").doc(decoded.uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    // Se ainda não existir no firestore (primeiro login que a trigger não pegou)
    await userRef.set({
      name: decoded.name || "Estudante",
      email: decoded.email,
      avatar: decoded.picture || null,
      xp: amount,
      level: 1,
      streak: 0,
      lastActiveAt: new Date().toISOString(),
    });
    return { success: true, newXp: amount, newLevel: 1, leveledUp: false };
  }

  const userData = userSnap.data()!;
  const newXp = (userData.xp || 0) + amount;
  
  // Lógica simples de Level Up (ex: 100 XP por level)
  const newLevel = Math.floor(newXp / 100) + 1;
  const leveledUp = newLevel > (userData.level || 1);

  await userRef.update({
    xp: newXp,
    level: newLevel,
    lastActiveAt: new Date().toISOString(),
  });

  revalidatePath("/dashboard");
  revalidatePath("/ranking");

  return { success: true, newXp, newLevel, leveledUp };
}

/**
 * Completa uma tarefa e concede XP
 */
export async function completeTask(taskId: string) {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  const taskRef = adminDb.collection("tasks").doc(taskId);
  const taskSnap = await taskRef.get();

  if (!taskSnap.exists || taskSnap.data()?.userId !== decoded.uid) {
    throw new Error("Task not found or unauthorized");
  }

  const taskData = taskSnap.data()!;

  if (taskData.completed) {
    return { success: false, message: "Task already completed" };
  }

  await taskRef.update({ 
    completed: true 
  });

  // Concede XP da tarefa
  await addXP(taskData.xpReward || 10);

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Adiciona ou remove uma matéria da lista de dificuldades do usuário.
 */
export async function toggleSubjectDifficulty(subject: string) {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  const userRef = adminDb.collection("users").doc(decoded.uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    await userRef.set({
      name: decoded.name || "Estudante",
      email: decoded.email,
      avatar: decoded.picture || null,
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveAt: new Date().toISOString(),
      subjectDifficulties: [subject]
    });
    return { success: true, added: true };
  }

  const userData = userSnap.data()!;
  const currentDifficulties = userData.subjectDifficulties || [];
  
  let newDifficulties: string[];
  let added: boolean;

  if (currentDifficulties.includes(subject)) {
    newDifficulties = currentDifficulties.filter((s: string) => s !== subject);
    added = false;
  } else {
    newDifficulties = [...currentDifficulties, subject];
    added = true;
  }

  await userRef.update({
    subjectDifficulties: newDifficulties,
    lastActiveAt: new Date().toISOString(),
  });

  revalidatePath("/dashboard");
  return { success: true, added };
}
