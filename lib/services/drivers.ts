import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "@/lib/firebase.admin";

export async function index() {
    const snap = await db
    .collection("users")
    .where("role", "==", "driver")
    .get();


  return snap.docs.map((doc: QueryDocumentSnapshot) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
