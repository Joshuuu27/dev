import { db } from "@/lib/firebase.browser";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from "firebase/firestore";

export interface SOSAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  latitude: number;
  longitude: number;
  address?: string;
  driverId?: string;
  driverName?: string;
  vehicleType?: string;
  plateNumber?: string;
  licenseNumber?: string;
  timestamp: Date;
  status: "active" | "resolved" | "cancelled";
}

export interface SOSAlertInput {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  latitude: number;
  longitude: number;
  address?: string;
  driverId?: string;
  driverName?: string;
  vehicleType?: string;
  plateNumber?: string;
  licenseNumber?: string;
}

const SOS_COLLECTION = "sos_alerts";

/**
 * Create a new SOS alert (client-side Firestore)
 */
export async function createSOSAlert(sosData: SOSAlertInput): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, SOS_COLLECTION), {
      ...sosData,
      timestamp: Timestamp.now(),
      status: "active",
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating SOS alert:", error);
    throw new Error("Failed to create SOS alert");
  }
}

/**
 * Create SOS alert via API (server-side, bypasses Firestore rules)
 */
export async function createSOSAlertViaAPI(sosData: SOSAlertInput): Promise<string> {
  const res = await fetch("/api/user/sos-alerts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sosData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to create SOS alert");
  }
  const data = (await res.json()) as { id?: string };
  return data.id ?? "";
}

/**
 * Get all active SOS alerts (for police)
 */
export async function getAllActiveSOSAlerts(): Promise<SOSAlert[]> {
  try {
    const q = query(
      collection(db, SOS_COLLECTION),
      where("status", "==", "active"),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const alerts: SOSAlert[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      alerts.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        driverId: data.driverId,
        driverName: data.driverName,
        vehicleType: data.vehicleType,
        plateNumber: data.plateNumber,
        licenseNumber: data.licenseNumber,
        timestamp: data.timestamp?.toDate() || new Date(),
        status: data.status || "active",
      });
    });

    return alerts;
  } catch (error) {
    console.error("Error fetching SOS alerts:", error);
    throw new Error("Failed to fetch SOS alerts");
  }
}

/**
 * Get user's SOS alerts via API (server-side, bypasses Firestore rules)
 */
export async function getUserSOSAlertsViaAPI(userId: string): Promise<SOSAlert[]> {
  const res = await fetch("/api/user/sos-alerts", { credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to fetch SOS alerts");
  }
  const data = (await res.json()) as any[];
  return data.map((d) => ({
    id: d.id,
    userId: d.userId,
    userName: d.userName,
    userEmail: d.userEmail,
    userPhone: d.userPhone,
    latitude: d.latitude,
    longitude: d.longitude,
    address: d.address,
    driverId: d.driverId,
    driverName: d.driverName,
    vehicleType: d.vehicleType,
    plateNumber: d.plateNumber,
    licenseNumber: d.licenseNumber,
    timestamp: d.timestamp ? new Date(d.timestamp) : new Date(),
    status: d.status || "active",
  }));
}

/**
 * Delete user's SOS alert via API (server-side, bypasses Firestore rules)
 */
export async function deleteSOSAlertViaAPI(alertId: string): Promise<void> {
  const res = await fetch(`/api/user/sos-alerts?id=${encodeURIComponent(alertId)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to delete SOS alert");
  }
}

/**
 * Get all SOS alerts for a specific user (client-side Firestore)
 */
export async function getUserSOSAlerts(userId: string): Promise<SOSAlert[]> {
  try {
    const q = query(
      collection(db, SOS_COLLECTION),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const alerts: SOSAlert[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      alerts.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        driverId: data.driverId,
        driverName: data.driverName,
        vehicleType: data.vehicleType,
        plateNumber: data.plateNumber,
        licenseNumber: data.licenseNumber,
        timestamp: data.timestamp?.toDate() || new Date(),
        status: data.status || "active",
      });
    });

    return alerts;
  } catch (error) {
    console.error("Error fetching user SOS alerts:", error);
    throw new Error("Failed to fetch user SOS alerts");
  }
}

/**
 * Get all SOS alerts for a specific driver
 */
export async function getDriverSOSAlerts(driverId: string): Promise<SOSAlert[]> {
  try {
    const q = query(
      collection(db, SOS_COLLECTION),
      where("driverId", "==", driverId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const alerts: SOSAlert[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      alerts.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        driverId: data.driverId,
        driverName: data.driverName,
        vehicleType: data.vehicleType,
        plateNumber: data.plateNumber,
        licenseNumber: data.licenseNumber,
        timestamp: data.timestamp?.toDate() || new Date(),
        status: data.status || "active",
      });
    });

    return alerts;
  } catch (error) {
    console.error("Error fetching driver SOS alerts:", error);
    throw new Error("Failed to fetch driver SOS alerts");
  }
}

/**
 * Update SOS alert status (client-side Firestore – requires rules for sos_alerts)
 */
export async function updateSOSAlertStatus(
  alertId: string,
  status: "active" | "resolved" | "cancelled"
): Promise<void> {
  try {
    const { doc, updateDoc } = await import("firebase/firestore");
    const alertRef = doc(db, SOS_COLLECTION, alertId);
    await updateDoc(alertRef, { status });
  } catch (error) {
    console.error("Error updating SOS alert status:", error);
    throw new Error("Failed to update SOS alert status");
  }
}

/**
 * Update SOS alert status via Police/CTTMO API (server-side, bypasses Firestore rules)
 * Use this from Police and CTTMO pages for reliable status updates.
 */
export async function updateSOSAlertStatusViaAPI(
  alertId: string,
  status: "active" | "resolved" | "cancelled"
): Promise<void> {
  const res = await fetch("/api/police/sos-alerts", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alertId, status }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to update SOS alert status");
  }
}
