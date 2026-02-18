import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get("driverId");

    let query: any = db.collection("reports");

    // If driverId is provided, filter by driver
    if (driverId) {
      query = query.where("driverId", "==", driverId);
    }

    // Order by creation date descending
    query = query.orderBy("createdAt", "desc");
    const snapshot = await query.get();

    const reports = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        incidentDate: data.incidentDate?.toDate?.() || null,
      };
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support both full ReportCaseInput and legacy { driverId, userId, message }
    const isFullPayload =
      body.commuterId != null && body.reportType != null && body.description != null;

    let dataToSave: Record<string, unknown>;

    if (isFullPayload) {
      const {
        commuterId,
        commuterName,
        commuterEmail,
        phoneNumber,
        reportType,
        description,
        driverId,
        driverName,
        vehicleNumber,
        plateNumber,
        location,
        incidentDate,
        imageUrls,
      } = body;

      if (!commuterId || !reportType || !description) {
        return NextResponse.json(
          { error: "commuterId, reportType, and description are required" },
          { status: 400 }
        );
      }

      dataToSave = {
        commuterId,
        commuterName: commuterName ?? "Anonymous",
        commuterEmail: commuterEmail ?? "",
        phoneNumber,
        reportType,
        description,
        driverId,
        driverName,
        vehicleNumber,
        plateNumber,
        location,
        imageUrls,
        status: "pending",
        createdAt: new Date(),
      };

      if (incidentDate) {
        dataToSave.incidentDate = incidentDate instanceof Date
          ? incidentDate
          : new Date(incidentDate);
      }
    } else {
      const { driverId, userId, message } = body;
      dataToSave = {
        driverId,
        userId,
        message,
        status: "pending",
        createdAt: new Date(),
      };
    }

    const docRef = await db.collection("reports").add(
      Object.fromEntries(Object.entries(dataToSave).filter(([_, v]) => v !== undefined && v !== null))
    );

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }
}
