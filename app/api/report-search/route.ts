import { NextResponse } from "next/server";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "@/lib/firebase.admin";

/**
 * GET /api/report-search?q=...
 * Search drivers and operators by name, return unified list with driver, operator, and plates.
 * Used by the report dialog to find driver/operator and auto-fill plate.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim().toLowerCase();

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const results: Array<{
      driverId: string;
      driverName: string;
      operatorId: string;
      operatorName: string;
      plates: string[];
    }> = [];
    const seen = new Set<string>();

    // Search drivers by name
    const driversSnap = await db
      .collection("users")
      .where("role", "==", "driver")
      .get();

    const drivers = driversSnap.docs
      .map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }))
      .filter((d: any) => {
        const name = (d.displayName || d.name || "").toString().toLowerCase();
        return name.includes(q);
      });

    for (const driver of drivers) {
      const driverName = (driver as any).displayName || (driver as any).name || "Unknown";
      const vehiclesSnap = await db
        .collection("vehicles")
        .where("assignedDriverId", "==", driver.id)
        .get();

      const plates: string[] = [];
      let operatorId = "";
      let operatorName = "Unknown";

      if (!vehiclesSnap.empty) {
        vehiclesSnap.docs.forEach((d: QueryDocumentSnapshot) => {
          const p = d.data().plateNumber;
          if (p && !plates.includes(p)) plates.push(p);
        });
        const firstVehicle = vehiclesSnap.docs[0].data();
        operatorId = firstVehicle.operatorId || "";
        if (operatorId) {
          const opDoc = await db.collection("users").doc(operatorId).get();
          if (opDoc.exists) {
            const opData = opDoc.data();
            operatorName = opData?.displayName || opData?.name || "Unknown";
          }
        }
      }

      const key = `${driver.id}-${operatorId}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          driverId: driver.id,
          driverName,
          operatorId,
          operatorName,
          plates: [...new Set(plates)].filter(Boolean),
        });
      }
    }

    // Search operators by name - get their vehicles with assigned drivers
    const operatorsSnap = await db
      .collection("users")
      .where("role", "==", "operator")
      .get();

    const operators = operatorsSnap.docs
      .map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }))
      .filter((o: any) => {
        const name = (o.displayName || o.name || "").toString().toLowerCase();
        return name.includes(q);
      });

    for (const operator of operators) {
      const operatorName = (operator as any).displayName || (operator as any).name || "Unknown";
      const vehiclesSnap = await db
        .collection("vehicles")
        .where("operatorId", "==", operator.id)
        .get();

      for (const vDoc of vehiclesSnap.docs) {
        const vData = vDoc.data();
        const driverId = vData.assignedDriverId || "";
        const driverName = vData.assignedDriverName || "Unassigned";
        const plate = vData.plateNumber || "";
        const key = `${driverId || "op-" + operator.id}-${operator.id}-${plate}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            driverId,
            driverName,
            operatorId: operator.id,
            operatorName,
            plates: plate ? [plate] : [],
          });
        }
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in report-search:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}
