import { NextResponse } from "next/server";
import { adminAuth, db } from "@/lib/firebase.admin";
import { formatDisplayName } from "@/lib/utils/name";

export async function POST(req: Request) {
  
  try {

    const cookieHeader = req.headers.get("cookie") || "";
     const token = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

    // if (!token) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const { email, password, role } = body;

    const firstName = (body.firstName ?? "").trim();
    const lastName = (body.lastName ?? "").trim();
    const middleName = (body.middleName ?? "").trim();
    const suffix = (body.suffix ?? "").trim();
    const legacyName = (body.name ?? "").trim();

    const name = firstName && lastName
      ? formatDisplayName({ firstName, lastName, middleName: middleName || undefined, suffix: suffix || undefined })
      : legacyName;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Missing email or password" }, { status: 400 });
    }

    // 1. Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name || undefined,
    });

    // 2. Save extra user fields into Firestore (optional)
    const profile: Record<string, unknown> = {
      email,
      name: name || undefined,
      role,
      createdAt: Date.now(),
    };
    if (firstName) profile.firstName = firstName;
    if (lastName) profile.lastName = lastName;
    if (middleName) profile.middleName = middleName;
    if (suffix) profile.suffix = suffix;

    await db.collection("users").doc(userRecord.uid).set(profile);

     await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false,error: error.message }, { status: 400 });
  }
}
