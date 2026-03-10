import { NextResponse } from "next/server";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "@/lib/firebase.admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const search = searchParams.get("search")?.trim().toLowerCase();

  try {
    if (id) {
      // return single driver
      const doc = await db.collection("users").doc(id).get();

      if (!doc.exists) {
        return NextResponse.json({ error: "Driver not found" }, { status: 404 });
      }

      return NextResponse.json({ id: doc.id, ...doc.data() });
    }

    // return all drivers (default), optionally filtered by name search
    const snap = await db
      .collection("users")
      .where("role", "==", "driver")
      .get();

    let drivers = snap.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (search && search.length >= 2) {
      drivers = drivers.filter((d: any) => {
        const name = (d.displayName || d.name || "").toString().toLowerCase();
        return name.includes(search);
      });
    }

    return NextResponse.json(drivers);
  } catch (error) {
    console.error("Error GET /api/drivers:", error);
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}
