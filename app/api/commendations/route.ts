import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support both full CommendationInput and legacy { driverId, userId, message, rating }
    const isFullPayload =
      body.commuterId != null &&
      body.driverId != null &&
      body.commendationType != null &&
      body.comment != null;

    let dataToSave: Record<string, unknown>;

    if (isFullPayload) {
      const {
        commuterId,
        commuterName,
        commuterEmail,
        phoneNumber,
        driverId,
        driverName,
        vehicleNumber,
        plateNumber,
        rating,
        comment,
        commendationType,
      } = body;

      if (!commuterId || !driverId || !commendationType || !comment) {
        return NextResponse.json(
          { error: "commuterId, driverId, commendationType, and comment are required" },
          { status: 400 }
        );
      }

      if (rating !== undefined && (rating < 1 || rating > 5)) {
        return NextResponse.json(
          { error: "Rating must be between 1 and 5" },
          { status: 400 }
        );
      }

      dataToSave = {
        commuterId,
        commuterName: commuterName ?? "Anonymous",
        commuterEmail: commuterEmail ?? "",
        driverId,
        driverName,
        vehicleNumber,
        plateNumber,
        phoneNumber,
        rating: rating ?? 5,
        comment,
        commendationType,
        createdAt: new Date(),
      };
    } else {
      const { driverId, userId, message, rating } = body;
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        return NextResponse.json(
          { error: "Rating must be between 1 and 5" },
          { status: 400 }
        );
      }
      dataToSave = {
        driverId,
        userId,
        message,
        rating: rating || null,
        createdAt: new Date(),
      };
    }

    const docRef = await db.collection("commendations").add(
      Object.fromEntries(Object.entries(dataToSave).filter(([_, v]) => v !== undefined))
    );

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save commendation" }, { status: 500 });
  }
}
