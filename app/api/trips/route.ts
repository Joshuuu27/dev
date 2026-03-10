import { NextResponse } from "next/server";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db, adminAuth, firebaseAdmin } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";

async function getUserId(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split("; ")
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!cookie) return null;
  try {
    const token = cookie.split("=")[1];
    const decoded = await adminAuth.verifySessionCookie(token, true);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await db
      .collection("trips")
      .where("userId", "==", userId)
      .get();

    const trips = snapshot.docs.map((docSnap: QueryDocumentSnapshot) => {
      const d = docSnap.data();
      const createdAt = d.createdAt?.toDate?.() ?? d.createdAt;
      const completedAt = d.completedAt?.toDate?.() ?? d.completedAt;
      return {
        id: docSnap.id,
        userId: d.userId,
        fromAddress: d.fromAddress ?? "",
        fromCoords: d.fromCoords ?? null,
        toAddress: d.toAddress ?? "",
        toCoords: d.toCoords ?? null,
        fare: d.fare ?? null,
        status: d.status ?? "completed",
        createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
        completedAt: completedAt instanceof Date ? completedAt.toISOString() : completedAt,
        startedAt: d.startedAt ?? 0,
        duration: d.duration ?? null,
        distance: d.distance ?? null,
      };
    });

    trips.sort((a: { createdAt?: string }, b: { createdAt?: string }) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json(trips);
  } catch (error: any) {
    console.error("Error fetching trips:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch trips" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      fromAddress,
      fromCoords,
      toAddress,
      toCoords,
      fare,
    } = body;

    if (!fromAddress || !toAddress) {
      return NextResponse.json(
        { error: "fromAddress and toAddress are required" },
        { status: 400 }
      );
    }

    const serverTimestamp = firebaseAdmin.firestore.FieldValue.serverTimestamp();

    const docRef = await db.collection("trips").add({
      userId,
      fromAddress: fromAddress ?? "",
      fromCoords: fromCoords ?? null,
      toAddress: toAddress ?? "",
      toCoords: toCoords ?? null,
      fare: fare ?? null,
      status: "ongoing",
      createdAt: serverTimestamp,
      startedAt: Date.now(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error: any) {
    console.error("Error creating trip:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save trip" },
      { status: 500 }
    );
  }
}
