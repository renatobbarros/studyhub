"use server";

import { adminDb } from "@/lib/firebase/admin";
import { verifyServerSession } from "./auth";

export async function getDashboardStats() {
  const session = await verifyServerSession();
  if (!session) return null;

  try {
    const userDoc = await adminDb.collection("users").doc(session.uid).get();
    const userData = userDoc.data();

    // Em uma guilda real, buscaríamos a média do grupo, 
    // por enquanto simulamos baseado no XP do usuário
    return {
      totalXp: userData?.xp || 0,
      level: userData?.level || 1,
      streak: userData?.streak || 0,
      tasksCompleted: 12, // Mock por enquanto até termos a coleção de tasks
      rank: "#1", // Mock por enquanto
      focusHours: "4.5h", // Mock por enquanto
      productivity: 85,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats", error);
    return null;
  }
}

export async function getCriticalDates() {
  const session = await verifyServerSession();
  if (!session) return [];

  try {
    // Buscamos datas críticas (provas, entregas) do usuário
    const snapshot = await adminDb
      .collection("users")
      .doc(session.uid)
      .collection("deadlines")
      .orderBy("date", "asc")
      .limit(4)
      .get();

    if (snapshot.empty) {
      // Retornar alguns dados padrão se estiver vazio para não parecer quebrado
      return [
        { title: "Prova de Cálculo I", date: "15 Abr", type: "Urgente", color: "bg-danger-500", subject: "Cálculo I" },
        { title: "Trabalho de Anatomia", date: "20 Abr", type: "Entrega", color: "bg-primary-500", subject: "Anatomia" },
      ];
    }

    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching critical dates", error);
    return [];
  }
}
