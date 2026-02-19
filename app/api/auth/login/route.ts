// /app/api/login/route.ts
import { NextResponse } from "next/server";
import { firebaseAdmin, db, adminAuth } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken, true);
    const uid = decoded.uid;
    const email = decoded.email ?? "";
    const name = decoded.name ?? "";
    const picture = decoded.picture ?? "";

    const userDoc = await db.collection("users").doc(uid).get();
    let role: string = "user";

    if (!userDoc.exists) {
      await db.collection("users").doc(uid).set({
        uid,
        email,
        name,
        picture,
        role: "user",
        provider: decoded.firebase?.sign_in_provider ?? "password",
        createdAt: Date.now(),
        lastLogin: Date.now(),
      });
    } else {
      role = userDoc.data()?.role ?? "user";
      // Don't block response on lastLogin update
      db.collection("users").doc(uid).update({ lastLogin: Date.now() }).catch(() => {});
    }

    const existingClaims = decoded.role;
    if (!existingClaims) {
      await adminAuth.setCustomUserClaims(uid, { role });
    }

    const expiresIn = 60 * 60 * 24 * 1000;
    const sessionCookie = await firebaseAdmin.auth().createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ status: "success", role });
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
