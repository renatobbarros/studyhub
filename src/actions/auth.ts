"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { isYesterday, isToday, startOfDay } from "date-fns";

export async function createSessionCookie(idToken: string) {
  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    const cookieStore = await cookies();
    
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    console.error("CRITICAL: Session creation error", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return { success: false, error: error.message };
  }
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { success: true };
}

export async function verifyServerSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    return null;
  }
}

export async function syncUserProfile() {
  const decoded = await verifyServerSession();
  if (!decoded) return null;

  const userRef = adminDb.collection("users").doc(decoded.uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    const newUser = {
      name: decoded.name || "Estudante",
      email: decoded.email,
      avatar: decoded.picture || null,
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    await userRef.set(newUser);
    return newUser;
  }

  const userData = userSnap.data()!;
  const lastActive = userData.lastActiveAt ? new Date(userData.lastActiveAt) : null;
  const now = new Date();
  
  let newStreak = userData.streak || 0;
  
  if (lastActive) {
    if (isYesterday(lastActive)) {
      newStreak += 1;
    } else if (!isToday(lastActive)) {
      // Se não é hoje nem ontem, quebrou a streak
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  // Update last active and streak
  const updates: any = { 
    lastActiveAt: now.toISOString(),
    streak: newStreak
  };
  
  await userRef.update(updates);
  
  return { ...userData, ...updates };
}

export async function getGuildMembers() {
  const session = await verifyServerSession();
  if (!session) return [];

  try {
    const snapshot = await adminDb.collection("users").orderBy("xp", "desc").limit(10).get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching guild members", error);
    return [];
  }
}

