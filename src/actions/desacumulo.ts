"use server";

import { adminDb } from "@/lib/firebase/admin";
import { verifyServerSession } from "./auth";
import { revalidatePath } from "next/cache";
import { getReinforcementVideos } from "./study-plan";
import OpenAI from "openai";

/**
 * Adiciona um novo conteúdo compartilhado de "Desacumulo"
 */
export async function addDesacumuloEntry(content: string) {
  const decoded = await verifyServerSession();
  if (!decoded) throw new Error("Unauthorized");

  // 1. Extrair palavras-chave usando Cerebras
  const apiKey = process.env.CEREBRAS_API_KEY;
  let keywords = [content.split(" ")[0]]; // Fallback

  if (apiKey) {
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.cerebras.ai/v1",
    });

    try {
      const response = await client.chat.completions.create({
        messages: [{ 
            role: "system", 
            content: "Você é um assistente acadêmico. Extraia os 2 termos mais importantes para busca no YouTube do texto abaixo. Retorne apenas os termos separados por vírgula." 
        }, { 
            role: "user", 
            content: content 
        }],
        model: "llama3.3-70b",
      });

      const extracted = response.choices[0].message.content;
      if (extracted) {
        keywords = extracted.split(",").map((k: string) => k.trim());
      }
    } catch (error) {
      console.error("Erro na extração de keywords da IA:", error);
    }
  }

  // 2. Buscar vídeos para cada keyword
  const allVideos = [];
  for (const kw of keywords) {
    const res = await getReinforcementVideos(kw);
    if (res.success) {
      allVideos.push(...res.videos);
    }
  }

  // 3. Salvar no Firestore (Escopo Global por enquanto, ou associado ao usuário)
  const entryRef = adminDb.collection("desacumulo").doc();
  await entryRef.set({
    content,
    userName: decoded.name || "Estudante",
    userId: decoded.uid,
    avatar: decoded.picture || null,
    keywords,
    videos: allVideos.slice(0, 4), // Top 4 vídeos
    createdAt: new Date().toISOString(),
  });

  // 4. Bonificação de XP por ajudar a comunidade
  const { addXP } = await import("./gamification");
  await addXP(25);

  revalidatePath("/desacumulo");
  return { success: true };
}

/**
 * Busca as últimas entradas de Desacumulo
 */
export async function getDesacumuloFeed() {
  const session = await verifyServerSession();
  if (!session) return { success: true, entries: [] };

  const snapshot = await adminDb
    .collection("desacumulo")
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  const entries = snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data()
  }));

  return { success: true, entries };
}
