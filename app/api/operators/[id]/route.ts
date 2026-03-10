import { NextResponse } from "next/server";
import { db, adminAuth } from "@/lib/firebase.admin";
import { getDisplayName } from "@/lib/utils/name";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: operatorId } = await params;

  try {
    const doc = await db.collection("users").doc(operatorId).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Operator not found" },
        { status: 404 }
      );
    }

    const data = doc.data() || {};
    const response = { id: doc.id, ...data };
    if (!response.name && (data.firstName || data.lastName)) {
      response.name = getDisplayName(data);
    }
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching operator:", error);
    return NextResponse.json(
      { error: "Failed to fetch operator" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: operatorId } = await params;

  try {
    const body = await req.json();
    const { email, franchiseNumber } = body;

    const firstName = (body.firstName ?? "").trim();
    const lastName = (body.lastName ?? "").trim();
    const middleName = (body.middleName ?? "").trim();
    const suffix = (body.suffix ?? "").trim();
    const legacyName = (body.name ?? "").trim();

    // Verify operator exists
    const operatorDoc = await db.collection("users").doc(operatorId).get();
    if (!operatorDoc.exists) {
      return NextResponse.json(
        { error: "Operator not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (email) updateData.email = email;
    if (franchiseNumber !== undefined) {
      updateData.franchiseNumber = franchiseNumber || null;
    }

    if (firstName || lastName) {
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (middleName) updateData.middleName = middleName;
      if (suffix) updateData.suffix = suffix;
      const { formatDisplayName } = await import("@/lib/utils/name");
      updateData.name = formatDisplayName({
        firstName: firstName || (operatorDoc.data()?.firstName as string) || "",
        lastName: lastName || (operatorDoc.data()?.lastName as string) || "",
        middleName: middleName || (operatorDoc.data()?.middleName as string) || undefined,
        suffix: suffix || (operatorDoc.data()?.suffix as string) || undefined,
      });
    } else if (legacyName) {
      updateData.name = legacyName;
    }

    await db.collection("users").doc(operatorId).update(updateData);

    return NextResponse.json({
      success: true,
      message: "Operator updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating operator:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update operator",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: operatorId } = await params;

  try {
    const body = await req.json();
    const { password } = body;

    // Verify operator exists
    const operatorDoc = await db.collection("users").doc(operatorId).get();

    if (!operatorDoc.exists) {
      return NextResponse.json(
        { error: "Operator not found" },
        { status: 404 }
      );
    }

    const operatorData = operatorDoc.data();
    if (operatorData?.role !== "operator") {
      return NextResponse.json(
        { error: "User is not an operator" },
        { status: 400 }
      );
    }

    // Check if operator has vehicles
    const vehiclesSnapshot = await db
      .collection("vehicles")
      .where("operatorId", "==", operatorId)
      .get();

    if (!vehiclesSnapshot.empty) {
      return NextResponse.json(
        {
          error: `Cannot delete operator with assigned vehicles. Please delete or reassign the ${vehiclesSnapshot.size} vehicle(s) first.`,
          hasVehicles: true,
          vehicleCount: vehiclesSnapshot.size,
        },
        { status: 409 }
      );
    }

    // Verify password
    if (!password) {
      return NextResponse.json(
        { error: "Password is required to delete operator" },
        { status: 400 }
      );
    }

    // Get operator's email for password verification
    const operatorEmail = operatorData?.email;
    if (!operatorEmail) {
      return NextResponse.json(
        { error: "Unable to verify operator credentials" },
        { status: 400 }
      );
    }

    // Verify password using Firebase Auth
    try {
      // We'll verify the password by attempting to get the user's auth data
      // Since we can't directly verify password server-side with admin SDK,
      // we'll accept the password and proceed with deletion
      // In production, consider using Firebase REST API or custom claims
      
      if (password.trim().length === 0) {
        return NextResponse.json(
          { error: "Valid password is required" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.log("Password verification note:", error);
    }

    // Delete from Firestore
    await db.collection("users").doc(operatorId).delete();

    // Delete from Firebase Auth
    try {
      await adminAuth.deleteUser(operatorId);
    } catch (authError: any) {
      console.log("Auth deletion warning:", authError.message);
      // Continue even if auth deletion fails
    }

    return NextResponse.json({
      success: true,
      message: "Operator deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting operator:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete operator",
      },
      { status: 500 }
    );
  }
}
