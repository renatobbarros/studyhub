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
  const { getAdminDb } = await import("@/lib/firebase/admin");
  const adminDb = getAdminDb();

  if (!adminDb) {
    console.error("parseScheduleWithAI: adminDb não inicializado");
    return { success: false, message: "Banco de dados não disponível." };
  }

  // Batch creation of tasks
  const batch = adminDb.batch();
  
  extractedData.forEach((item: any) => {
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

  return { success: true, message: `${extractedData.length} tarefas extraídas com sucesso!` };
}

/**
 * Novo: Processa um arquivo PDF de cronograma usando IA
 */
export async function parseSchedulePDF(formData: FormData) {
  const session = await verifyServerSession();
  if (!session) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) return { success: false, message: "Nenhum arquivo enviado" };

  // Importar dinamicamente biblioteca de servidor
  let pdf;
  try {
    // Tentativa de importação compatível com diferentes ambientes node
    const pdfLib = await import("pdf-parse");
    pdf = (pdfLib as any).default || pdfLib;
  } catch (e) {
    console.error("Erro ao carregar pdf-parse:", e);
    return { success: false, message: "Dependência de servidor (pdf-parse) não disponível." };
  }
  
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const data = await pdf(buffer);
    const extractedText = data.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return { success: false, message: "Não foi possível extrair texto do PDF." };
    }

    // Encaminha o texto extraído para o processamento de IA existente
    return await parseScheduleWithAI(extractedText);
  } catch (error) {
    console.error("Erro no processamento do PDF:", error);
    return { success: false, message: "Erro ao ler o arquivo PDF." };
  }
}


/**
 * Busca sugestões de vídeos para reforço (Simulado com links inteligentes para o MVP)
 */
export async function getReinforcementVideos(subject: string) {
  const session = await verifyServerSession();
  if (!session) throw new Error("Unauthorized");

  // No futuro, usar YouTube Data API. Para o MVP, geramos links de busca otimizados.
  // Evitar redundância se o termo já for específico ou contiver "aula"
  const suffix = subject.toLowerCase().includes("aula") ? "completa" : "aula completa explicação";
  const searchQuery = encodeURIComponent(`${subject} ${suffix}`);
  
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

  const { getAdminDb } = await import("@/lib/firebase/admin");
  const adminDb = getAdminDb();
  
  if (!adminDb) {
    console.error("getUserDifficulties: adminDb não inicializado");
    return { success: true, difficulties: [] };
  }

  const userSnap = await adminDb.collection("users").doc(session.uid).get();
  const manualDifficulties = userSnap.data()?.subjectDifficulties || [];

  // 2. Assuntos do Desacumulo marcados como NÃO dominados
  const desacumuloSnap = await adminDb.collection("desacumulo")
    .where("userId", "==", session.uid)
    .where("mastered", "==", false)
    .get();
  
  const desacumuloDifficulties = Array.from(new Set(
    desacumuloSnap.docs.map((doc: any) => doc.data().subject)
  ));

  // Combinar ambos sem duplicatas
  const combined = Array.from(new Set([...manualDifficulties, ...desacumuloDifficulties]));
  
  return { 
    success: true, 
    difficulties: combined 
  };
}
