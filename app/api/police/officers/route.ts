import { NextResponse } from "next/server";
import { adminAuth, db, firebaseAdmin } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";
import { formatDisplayName } from "@/lib/utils/name";

export async function POST(req: Request) {
  try {
    // Verify the requester is a police officer
    const cookieHeader = req.headers.get("cookie") || "";
    const cookie = cookieHeader
      .split("; ")
      .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

    if (!cookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = cookie.split("=")[1];
    const decoded = await firebaseAdmin.auth().verifySessionCookie(token, true);
    
    // Get user role from Firestore
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const role = userDoc.data()?.role;

    // Only police_head can create new police accounts
    if (role !== "police_head") {
      return NextResponse.json(
        { error: "Only the police head can create new police officer accounts" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    const firstName = (body.firstName ?? "").trim();
    const lastName = (body.lastName ?? "").trim();
    const middleName = (body.middleName ?? "").trim();
    const suffix = (body.suffix ?? "").trim();
    const legacyName = (body.name ?? "").trim();

    const name = firstName && lastName
      ? formatDisplayName({ firstName, lastName, middleName: middleName || undefined, suffix: suffix || undefined })
      : legacyName;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields: firstName and lastName" },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: email, password" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if email already exists
    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    } catch (error: any) {
      // User doesn't exist, which is what we want
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // Save user profile to Firestore with police role
    const profile: Record<string, unknown> = {
      email,
      name,
      role: "police",
      createdAt: Date.now(),
      createdBy: decoded.uid, // Track who created this account
    };
    if (firstName) profile.firstName = firstName;
    if (lastName) profile.lastName = lastName;
    if (middleName) profile.middleName = middleName;
    if (suffix) profile.suffix = suffix;

    await db.collection("users").doc(userRecord.uid).set(profile);

    // Set custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: "police" });

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      message: "Police officer account created successfully",
    });
  } catch (error: any) {
    console.error("Error creating police officer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create police officer account" },
      { status: 400 }
    );
  }
}
