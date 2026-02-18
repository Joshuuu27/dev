import { NextResponse } from "next/server";
import { db, adminAuth } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";
import { DocumentSnapshot } from "firebase-admin/firestore";

const ALLOWED_ROLES = ["police", "police_head", "cttmo"];

async function verifyPoliceOrCttmo(request: Request): Promise<{ uid: string; role: string } | null> {
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

    if (!ALLOWED_ROLES.includes(role)) return null;
    return { uid: decoded.uid, role };
  } catch {
    return null;
  }
}

export async function PATCH(request: Request) {
  const auth = await verifyPoliceOrCttmo(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { alertId, status } = body;

    if (!alertId || !status) {
      return NextResponse.json(
        { error: "alertId and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["active", "resolved", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "status must be active, resolved, or cancelled" },
        { status: 400 }
      );
    }

    const alertRef = db.collection("sos_alerts").doc(alertId);
    const alertDoc = await alertRef.get();

    if (!alertDoc.exists) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    await alertRef.update({ status });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating SOS alert status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update SOS alert status" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Fetch all SOS alerts from Firestore (collection is 'sos_alerts')
    const alertsSnapshot = await db.collection("sos_alerts").orderBy("timestamp", "desc").get();
    
    const alerts: any[] = [];
    alertsSnapshot.forEach((doc: DocumentSnapshot) => {
      const data = doc.data();
      alerts.push({
        id: doc.id,
        ...data,
        timestamp: data?.timestamp?.toDate?.() || new Date(),
      });
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching SOS alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch SOS alerts" },
      { status: 500 }
    );
  }
}
