import { NextResponse } from "next/server";
import { db, adminAuth } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";

async function verifyUser(request: Request): Promise<string | null> {
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
  const userId = await verifyUser(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const snapshot = await db
      .collection("reports")
      .where("commuterId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const reports = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
        incidentDate: data?.incidentDate?.toDate?.()?.toISOString?.() ?? null,
      };
    });

    return NextResponse.json(reports);
  } catch (err: any) {
    console.error("Error fetching user reports:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const userId = await verifyUser(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("id");
    if (!reportId) {
      return NextResponse.json({ error: "Report id is required" }, { status: 400 });
    }
    const reportRef = db.collection("reports").doc(reportId);
    const reportDoc = await reportRef.get();
    if (!reportDoc.exists) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    const data = reportDoc.data();
    if (data?.commuterId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (data?.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending reports can be deleted" },
        { status: 400 }
      );
    }
    await reportRef.delete();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting report:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete report" },
      { status: 500 }
    );
  }
}
