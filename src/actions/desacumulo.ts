"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { verifyServerSession } from "./auth";
import { revalidatePath } from "next/cache";
import { getReinforcementVideos } from "./study-plan";
import OpenAI from "openai";

/**
 * Adiciona um novo conteúdo compartilhado de "Desacumulo"
 */
export async function addDesacumuloEntry(content: string, subject: string = "Geral") {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  // 1. Extrair informações e formatar conteúdo usando Cerebras
  const apiKey = process.env.CEREBRAS_API_KEY;
  // Melhoria do fallback: pega o primeiro bullet point se a IA falhar
  const firstLine = content.split("\n")[0].replace(/^[•\-\*]\s*/, "").trim();
  let keywords = [subject !== "Geral" ? subject : null, firstLine].filter(Boolean) as string[]; 
  let formattedContent = content; // Fallback

  if (apiKey) {
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.cerebras.ai/v1",
    });

    const prompt = `Analise a lista de tópicos acadêmicos abaixo.
Sua tarefa é extrair 2 termos de busca extremamente específicos e técnicos para o YouTube.
Se a matéria (subject) for "Geral", ignore-a e foque 100% nos tópicos listados no conteúdo.
Se a matéria for específica (ex: Cálculo, Direito), use-a como contexto.

O objetivo é encontrar videoaulas que expliquem exatamente o que foi listado.
Exemplo de entrada: "introdução a sistemas de informação - que elementos formam o SI"
Exemplo de saída: "elementos que compõem sistemas de informação aula", "o que é SI componentes explicação"

Retorne APENAS um JSON no formato:
{
  "searchQueries": ["termo 1", "termo 2"]
}`;

    try {
      const response = await client.chat.completions.create({
        messages: [{ 
            role: "system", 
            content: "Você é um assistente acadêmico estruturador de dados." 
        }, { 
            role: "user", 
            content: `${prompt}\n\nConteúdo original:\n${content}`
        }],
        model: "llama3.3-70b",
        response_format: { type: "json_object" },
      });

      const messageContent = response.choices[0].message.content;
      if (messageContent) {
        const parsed = JSON.parse(messageContent);
        if (parsed.searchQueries && Array.isArray(parsed.searchQueries) && parsed.searchQueries.length > 0) {
          keywords = parsed.searchQueries;
        }
      }
    } catch (error) {
      console.error("Erro na estruturação via Cerebras:", error);
    }
  }

  // 2. Buscar vídeos para cada keyword extraída (searchQueries)
  const allVideos = [];
  for (const kw of keywords) {
    const res = await getReinforcementVideos(kw);
    if (res.success) {
      allVideos.push(...res.videos);
    }
  }

  // 3. Salvar no Firestore
  const adminDb = getAdminDb();
  if (!adminDb) {
    console.error("addDesacumuloEntry: adminDb não inicializado");
    return { success: false, message: "Banco de dados indisponível." };
  }
  const entryRef = adminDb.collection("desacumulo").doc();
  await entryRef.set({
    userId: decoded.uid,
    userName: decoded.name || "Estudante",
    avatar: decoded.picture || null,
    subject,
    content: formattedContent,
    keywords,
    videos: allVideos.slice(0, 4), // Top 4 vídeos
    mastered: false, // Novo: campo para feedback de domínio
    createdAt: new Date().toISOString(),
  });

  // 4. Bonificação de XP por ajudar a comunidade
  const { addXP } = await import("./gamification");
  await addXP(25);

  revalidatePath("/desacumulo");
  return { success: true };
}

/**
 * Alterna o status de domínio de um tópico
 */
export async function toggleMastered(id: string) {
  const session = await verifyServerSession();
  if (!session) throw new Error("Unauthorized");

  const adminDb = getAdminDb();
  if (!adminDb) return { success: false, message: "Banco de dados indisponível." };

  const docRef = adminDb.collection("desacumulo").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists || docSnap.data()?.userId !== session.uid) {
    throw new Error("Não autorizado ou registro não existe");
  }

  const currentStatus = docSnap.data()?.mastered || false;
  await docRef.update({ mastered: !currentStatus });

  revalidatePath("/desacumulo");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Busca as últimas entradas de Desacumulo com filtro opcional
 */
export async function getDesacumuloFeed(subject?: string) {
  const session = await verifyServerSession();
  if (!session) return { success: true, entries: [] };

  const adminDb = getAdminDb();
  if (!adminDb) {
    console.error("getDesacumuloFeed: adminDb não inicializado");
    return { success: true, entries: [] };
  }

  let query = adminDb.collection("desacumulo").orderBy("createdAt", "desc");
  
  if (subject && subject !== "Geral") {
    query = query.where("subject", "==", subject);
  }

  const snapshot = await query.limit(20).get();

  const entries = snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data()
  }));

  return { success: true, entries };
}

/**
 * Exclui uma entrada de Desacumulo (CRUD)
 */
export async function deleteDesacumuloEntry(id: string) {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  try {
    const adminDb = getAdminDb();
    if (!adminDb) return { success: false, error: "BD indisponível" };

    const docRef = adminDb.collection("desacumulo").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return { success: false, error: "Post não encontrado" };

    // Verificar se é o dono ou se é admin
    const userSnap = await adminDb.collection("users").doc(decoded.uid).get();
    const isAdmin = userSnap.data()?.isAdmin === true;

    if (doc.data()?.userId !== decoded.uid && !isAdmin) {
      return { success: false, error: "Sem permissão" };
    }

    await docRef.delete();
    revalidatePath("/desacumulo");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao excluir" };
  }
}
