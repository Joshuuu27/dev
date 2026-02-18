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

/**
 * GET: Fetch commendations where driverId matches the logged-in driver
 */
export async function GET(req: Request) {
  const userId = await verifyUser(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const snapshot = await db
      .collection("commendations")
      .where("driverId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const commendations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
      };
    });

    return NextResponse.json(commendations);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch driver commendations";
    console.error("Error fetching driver commendations:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
