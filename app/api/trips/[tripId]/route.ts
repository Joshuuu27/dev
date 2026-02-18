import { NextResponse } from "next/server";
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await params;
  if (!tripId) {
    return NextResponse.json({ error: "tripId required" }, { status: 400 });
  }

  try {
    const tripRef = db.collection("trips").doc(tripId);
    const tripSnap = await tripRef.get();

    if (!tripSnap.exists) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const tripData = tripSnap.data();
    if (tripData?.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const startedAt = tripData?.startedAt ?? Date.now();
    const durMs = Date.now() - startedAt;
    const duration = Math.round(durMs / 60000) + " minutes";
    const serverTimestamp = firebaseAdmin.firestore.FieldValue.serverTimestamp();

    await tripRef.update({
      status: "completed",
      completedAt: serverTimestamp,
      duration,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error completing trip:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to complete trip" },
      { status: 500 }
    );
  }
}
