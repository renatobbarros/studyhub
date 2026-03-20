"use server";

import { verifyServerSession } from "./auth";
import OpenAI from "openai";

export async function generateStudyPlan(subject: string, examDate: Date) {
  const session = await verifyServerSession();
  if (!session) throw new Error("Unauthorized");

  // Mocked AI output for MVP. In Phase 2, this will call OpenAI API.
  const plan = [
    {
      day: "Dia 1",
      topic: `Resumo de ${subject}`,
      method: "Leitura Ativa",
      duration: 60,
    },
    {
      day: "Dia 2",
      topic: `Flashcards de ${subject}`,
      method: "Spaced Repetition",
      duration: 30,
    },
    {
      day: "Dia 3",
      topic: "Resolução de Questões",
      method: "Active Recall",
      duration: 90,
    }
  ];

  // Simulando delay da IA
  await new Promise(resolve => setTimeout(resolve, 2000));

  return { success: true, plan };
}

export async function parseScheduleWithAI(text: string) {
  const session = await verifyServerSession();
  if (!session) throw new Error("Unauthorized");

  // In a real scenario, we'd use @google/generative-ai here
  // For now, let's pretend the IA extracted these from the text
  const extractedData = [
    { title: "Prova de Introdução ao Cálculo", date: "2026-04-15", subject: "Cálculo I" },
    { title: "Entrega de Trabalho Prático", date: "2026-04-20", subject: "Anatomia" },
  ];

  // Dynamically import admin for safety in edge environments
  const { adminDb } = await import("@/lib/firebase/admin");

  // Batch creation of tasks
  const batch = adminDb.batch();
  
  extractedData.forEach(item => {
    const taskRef = adminDb.collection("tasks").doc();
    batch.set(taskRef, {
      title: item.title,
      userId: session.uid,
      dueDate: new Date(item.date).toISOString(),
      completed: false,
      xpReward: 50, // Higher reward for AI imported dates
      createdAt: new Date().toISOString(),
      isAiGenerated: true
    });
  });

  await batch.commit();
  
  // Award bonus XP for student collaboration
  const { addXP } = await import("./gamification");
  await addXP(100);

  return { success: true };
}


/**
 * Busca sugestões de vídeos para reforço (Simulado com links inteligentes para o MVP)
 */
export async function getReinforcementVideos(subject: string) {
  const session = await verifyServerSession();
  if (!session) throw new Error("Unauthorized");

  // No futuro, usar YouTube Data API. Para o MVP, geramos links de busca otimizados.
  const searchQuery = encodeURIComponent(`${subject} aula completa explicação`);
  
  return {
    success: true,
    videos: [
      {
        title: `Principais conceitos de ${subject}`,
        url: `https://www.youtube.com/results?search_query=${searchQuery}`,
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
      },
      {
        title: `${subject} para Iniciantes`,
        url: `https://www.youtube.com/results?search_query=${searchQuery}+iniciantes`,
        thumbnail: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=225&fit=crop",
      }
    ]
  };
}

/**
 * Gera 4 questões sobre um assunto usando Cerebras AI (via Llama 3.3)
 */
export async function generateReinforcementQuestions(subject: string) {
  const session = await verifyServerSession();
  if (!session) throw new Error("Unauthorized");

  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    return { 
      success: false, 
      message: "CEREBRAS_API_KEY não configurada no servidor." 
    };
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.cerebras.ai/v1",
  });

  const prompt = `Gere 4 questões de múltipla escolha sobre o assunto "${subject}" para validar o conhecimento de um estudante universitário. 
  Retorne APENAS o JSON puro, sem markdown, no seguinte formato:
  {
    "questions": [
      {
        "id": 1,
        "text": "Pergunta aqui?",
        "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
        "correctIndex": 0
      }
    ]
  }
  As questões devem ser desafiadoras e em Português do Brasil.`;

  try {
    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3.3-70b", // Cerebras model
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Resposta vazia da IA.");
    
    const data = JSON.parse(content);
    return { success: true, questions: data.questions };
  } catch (error) {
    console.error("Erro ao gerar questões com Cerebras:", error);
    return { success: false, message: "Falha ao gerar questões via Cerebras AI." };
  }
}

/**
 * Busca a lista de dificuldades do usuário atual
 */
export async function getUserDifficulties() {
  const session = await verifyServerSession();
  if (!session) return { success: true, difficulties: [] };

  const { adminDb } = await import("@/lib/firebase/admin");
  const userSnap = await adminDb.collection("users").doc(session.uid).get();

  if (!userSnap.exists) return { success: true, difficulties: [] };
  
  return { 
    success: true, 
    difficulties: userSnap.data()?.subjectDifficulties || [] 
  };
}
