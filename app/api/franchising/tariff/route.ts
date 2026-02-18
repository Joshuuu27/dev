import { NextResponse } from "next/server";
import { db, adminAuth } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";

const TARIFF_COLLECTION = "tariff";
const TARIFF_DOC_ID = "fare_matrix";

async function verifyFranchising(request: Request): Promise<{ uid: string } | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split("; ")
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!cookie) return null;
  try {
    const token = cookie.split("=")[1];
    const decoded = await adminAuth.verifySessionCookie(token, true);
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const userData = userDoc.data();
    const role = userData?.role || "user";
    if (role !== "franchising") return null;
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const tariffRef = db.collection(TARIFF_COLLECTION).doc(TARIFF_DOC_ID);
    const tariffSnap = await tariffRef.get();
    if (!tariffSnap.exists) {
      return NextResponse.json({ fare_matrix: null });
    }
    const data = tariffSnap.data();
    return NextResponse.json({ fare_matrix: data?.fare_matrix ?? null });
  } catch (err: any) {
    console.error("Error fetching tariff:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch tariff" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const auth = await verifyFranchising(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { fare_matrix, note } = body;
    if (!fare_matrix || !Array.isArray(fare_matrix)) {
      return NextResponse.json(
        { error: "fare_matrix (array) is required" },
        { status: 400 }
      );
    }
    const tariffRef = db.collection(TARIFF_COLLECTION).doc(TARIFF_DOC_ID);
    await tariffRef.set(
      {
        fare_matrix,
        note: note ?? "Tariff rates based on gasoline price ranges",
        updatedAt: new Date(),
        updatedBy: auth.uid,
      },
      { merge: true }
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating tariff:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update tariff" },
      { status: 500 }
    );
  }
}
