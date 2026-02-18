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
      .collection("sos_alerts")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .get();

    const alerts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data?.timestamp?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
      };
    });

    return NextResponse.json(alerts);
  } catch (err: any) {
    console.error("Error fetching user SOS alerts:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch SOS alerts" },
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
    const alertId = searchParams.get("id");
    if (!alertId) {
      return NextResponse.json({ error: "Alert id is required" }, { status: 400 });
    }
    const alertRef = db.collection("sos_alerts").doc(alertId);
    const alertDoc = await alertRef.get();
    if (!alertDoc.exists) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }
    const data = alertDoc.data();
    if (data?.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await alertRef.delete();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting SOS alert:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete SOS alert" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      userName,
      userEmail,
      userPhone,
      latitude,
      longitude,
      address,
      driverId,
      driverName,
      vehicleType,
      plateNumber,
      licenseNumber,
    } = body;

    if (!userId || latitude == null || longitude == null) {
      return NextResponse.json(
        { error: "userId, latitude, and longitude are required" },
        { status: 400 }
      );
    }

    const dataToSave: Record<string, unknown> = {
      userId,
      userName: userName ?? "Unknown User",
      userEmail: userEmail ?? "",
      latitude: Number(latitude),
      longitude: Number(longitude),
      address,
      driverId,
      driverName,
      vehicleType,
      plateNumber,
      licenseNumber,
      userPhone,
      timestamp: new Date(),
      status: "active",
    };

    const docRef = await db.collection("sos_alerts").add(
      Object.fromEntries(Object.entries(dataToSave).filter(([_, v]) => v !== undefined && v !== null))
    );

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err: any) {
    console.error("Error creating SOS alert:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create SOS alert" },
      { status: 500 }
    );
  }
}
