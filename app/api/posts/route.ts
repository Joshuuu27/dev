export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "@/lib/firebase.admin";

export async function GET() {
  const snapshot = await db.collection("posts").get();

  const posts = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(posts);
}
