import { NextResponse } from "next/server";
import { db, adminAuth } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";

const SETTINGS_DOC_ID = "app_settings";
const GAS_PRICE_FIELD = "currentGasPrice";

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
    const settingsRef = db.collection("settings").doc(SETTINGS_DOC_ID);
    const settingsSnap = await settingsRef.get();
    if (!settingsSnap.exists) {
      return NextResponse.json({ currentGasPrice: null });
    }
    const data = settingsSnap.data();
    const gasPrice = data?.[GAS_PRICE_FIELD];
    const value =
      gasPrice !== undefined && gasPrice !== null
        ? typeof gasPrice === "number"
          ? gasPrice
          : parseFloat(gasPrice)
        : null;
    return NextResponse.json({
      currentGasPrice: typeof value === "number" && !isNaN(value) ? value : null,
    });
  } catch (err: any) {
    console.error("Error fetching settings:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const auth = await verifyFranchising(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { currentGasPrice } = body;
    if (currentGasPrice === undefined || currentGasPrice === null) {
      return NextResponse.json(
        { error: "currentGasPrice is required" },
        { status: 400 }
      );
    }
    const price = typeof currentGasPrice === "number" ? currentGasPrice : parseFloat(currentGasPrice);
    if (isNaN(price) || price < 40 || price > 99.99) {
      return NextResponse.json(
        { error: "Gas price must be between ₱40.00 and ₱99.99 per liter" },
        { status: 400 }
      );
    }
    const settingsRef = db.collection("settings").doc(SETTINGS_DOC_ID);
    await settingsRef.set(
      {
        [GAS_PRICE_FIELD]: price,
        updatedAt: new Date(),
        updatedBy: auth.uid,
      },
      { merge: true }
    );
    return NextResponse.json({ success: true, currentGasPrice: price });
  } catch (err: any) {
    console.error("Error updating gas price:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update gas price" },
      { status: 500 }
    );
  }
}
