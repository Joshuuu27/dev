import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";
import { formatDisplayName } from "@/lib/utils/name";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, email, role } = body;

    // Support name parts or legacy single name
    const firstName = (body.firstName ?? "").trim();
    const lastName = (body.lastName ?? "").trim();
    const middleName = (body.middleName ?? "").trim();
    const suffix = (body.suffix ?? "").trim();
    const legacyName = (body.name ?? "").trim();

    const name = firstName && lastName
      ? formatDisplayName({ firstName, lastName, middleName: middleName || undefined, suffix: suffix || undefined })
      : legacyName;

    if (!uid) {
      return NextResponse.json(
        { error: "Missing user ID" },
        { status: 400 }
      );
    }

    // Save user profile to Firestore
    const profile: Record<string, unknown> = {
      uid,
      email,
      role: role || "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (firstName) profile.firstName = firstName;
    if (lastName) profile.lastName = lastName;
    if (middleName) profile.middleName = middleName;
    if (suffix) profile.suffix = suffix;
    if (name) profile.name = name;

    await db.collection("users").doc(uid).set(profile, { merge: true });

    return NextResponse.json({ success: true, uid });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register user" },
      { status: 500 }
    );
  }
}
