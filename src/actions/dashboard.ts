"use server";

import { adminDb } from "@/lib/firebase/admin";
import { verifyServerSession } from "./auth";
import { startOfWeek, endOfWeek, startOfDay } from "date-fns";
import { getLevelInfo } from "@/lib/gamification-utils";

export async function getDashboardStats() {
  const session = await verifyServerSession();
  if (!session) return null;

  try {
    const userDoc = await adminDb.collection("users").doc(session.uid).get();
    const userData = userDoc.data();
    const xp = userData?.xp || 0;
    const levelInfo = getLevelInfo(xp);

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Segunda-feira
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const todayStart = startOfDay(now);

    // 1. Buscar Tasks concluídas (Total e Hoje)
    const tasksSnapshot = await adminDb.collection("tasks")
      .where("userId", "==", session.uid)
      .where("completed", "==", true)
      .get();
    
    const totalTasks = tasksSnapshot.size;
    const tasksToday = tasksSnapshot.docs.filter((doc: any) => 
      new Date(doc.data().createdAt).getTime() >= todayStart.getTime()
    ).length;

    // 2. Buscar Pendências desta semana (para o texto do dashboard)
    const pendingSnapshot = await adminDb.collection("tasks")
      .where("userId", "==", session.uid)
      .where("completed", "==", false)
      .get();
    
    const pendingThisWeek = pendingSnapshot.docs.filter((doc: any) => {
      const dueDate = doc.data().dueDate ? new Date(doc.data().dueDate) : null;
      return dueDate && dueDate >= weekStart && dueDate <= weekEnd;
    }).length;

    // 3. Buscar Foco (Total em Horas)
    const focusSnapshot = await adminDb.collection("focus_sessions")
      .where("userId", "==", session.uid)
      .get();
    
    const totalFocusMinutes = focusSnapshot.docs.reduce((acc: number, doc: any) => acc + (doc.data().duration || 0), 0);
    const focusHours = (totalFocusMinutes / 60).toFixed(1);

    // 4. Calcular Produtividade (Média simples baseada em tasks concluídas vs totais da semana)
    const allTasksThisWeek = [...tasksSnapshot.docs, ...pendingSnapshot.docs].filter((doc: any) => {
      const date = doc.data().dueDate ? new Date(doc.data().dueDate) : new Date(doc.data().createdAt);
      return date >= weekStart && date <= weekEnd;
    });

    const completedThisWeek = allTasksThisWeek.filter((doc: any) => doc.data().completed).length;
    const productivity = allTasksThisWeek.length > 0 
      ? Math.round((completedThisWeek / allTasksThisWeek.length) * 100) 
      : 0;

    return {
      totalXp: xp,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      levelProgress: levelInfo.progress,
      streak: userData?.streak || 0,
      tasksCompleted: totalTasks,
      tasksToday: tasksToday,
      pendingThisWeek: pendingThisWeek,
      rank: "#1", // Mantemos mock por enquanto ou buscamos posição real se houver tempo
      focusHours: `${focusHours}h`,
      productivity: productivity,
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
    // Buscamos tarefas não concluídas com data de entrega futura, limitando às 4 mais próximas
    const now = new Date();
    const snapshot = await adminDb
      .collection("tasks")
      .where("userId", "==", session.uid)
      .where("completed", "==", false)
      .where("dueDate", ">=", now.toISOString())
      .orderBy("dueDate", "asc")
      .limit(4)
      .get();

    if (snapshot.empty) {
      return [];
    }

    const typeLabels: any = {
      urgent: "Urgente",
      task: "Tarefa",
      exam: "Prova",
      delivery: "Entrega"
    };

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      const dueDate = new Date(data.dueDate);
      
      // Formatar data abreviada: "15 Abr"
      const formattedDate = dueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

      return {
        id: doc.id,
        title: data.title,
        date: formattedDate,
        type: typeLabels[data.type] || "Prazo",
        color: data.type === 'exam' ? "bg-danger-500" : "bg-primary-500",
        subject: data.subject || "Geral"
      };
    });
  } catch (error) {
    console.error("Error fetching critical dates", error);
    return [];
  }
}
