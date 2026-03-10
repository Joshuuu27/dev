import { NextResponse } from "next/server";
import { db, firebaseAdmin } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookie = cookieHeader
      .split("; ")
      .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

    if (!cookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = cookie.split("=")[1];
    const decoded = await firebaseAdmin.auth().verifySessionCookie(token, true);

    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const role = userDoc.data()?.role;

    if (role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can access this endpoint" },
        { status: 403 }
      );
    }

    // Query counts for each role in parallel (Firestore has no OR for different values)
    const [
      policeSnapshot,
      policeHeadSnapshot,
      cttmoSnapshot,
      commutersSnapshot,
      franchiseSnapshot,
      operatorsSnapshot,
      driversSnapshot,
    ] = await Promise.all([
      db.collection("users").where("role", "==", "police").get(),
      db.collection("users").where("role", "==", "police_head").get(),
      db.collection("users").where("role", "==", "cttmo").get(),
      db.collection("users").where("role", "==", "user").get(),
      db.collection("users").where("role", "==", "franchising").get(),
      db.collection("users").where("role", "==", "operator").get(),
      db.collection("users").where("role", "==", "driver").get(),
    ]);

    const stats = {
      police: policeSnapshot.size + policeHeadSnapshot.size,
      cttmo: cttmoSnapshot.size,
      commuters: commutersSnapshot.size,
      franchise: franchiseSnapshot.size,
      operators: operatorsSnapshot.size,
      drivers: driversSnapshot.size,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 400 }
    );
  }
}
