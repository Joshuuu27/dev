import { db } from "@/lib/firebase.browser";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export interface ReportCase {
  id: string;
  commuterId: string;
  commuterName: string;
  commuterEmail: string;
  phoneNumber?: string;
  reportType: string;
  description: string;
  driverId?: string;
  vehicleNumber?: string;
  plateNumber?: string;
  location?: string;
  incidentDate?: Date;
  imageUrls?: string[];
  createdAt: Date;
  status: "pending" | "resolved" | "investigating";
  driverName?: string;
}

export interface ReportCaseInput {
  commuterId: string;
  commuterName: string;
  commuterEmail: string;
  phoneNumber?: string;
  reportType: string;
  description: string;
  driverId?: string;
  driverName?: string;
  vehicleNumber?: string;
  plateNumber?: string;
  location?: string;
  incidentDate?: Date;
  imageUrls?: string[];
}

const REPORTS_COLLECTION = "reports";

/**
 * Submit a new report case from a commuter (client-side Firestore)
 */
export async function submitReportCase(
  reportData: ReportCaseInput
): Promise<string> {
  try {
    const dataToSave: Record<string, unknown> = {};
    Object.entries(reportData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        dataToSave[key] = value;
      }
    });

    if (reportData.incidentDate) {
      dataToSave.incidentDate = Timestamp.fromDate(reportData.incidentDate);
    }

    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
      ...dataToSave,
      createdAt: Timestamp.now(),
      status: "pending",
    });
    return docRef.id;
  } catch (error) {
    console.error("Error submitting report case:", error);
    throw new Error("Failed to submit report case");
  }
}

/**
 * Submit report via API (server-side, bypasses Firestore rules)
 */
export async function submitReportCaseViaAPI(
  reportData: ReportCaseInput
): Promise<string> {
  const payload = { ...reportData };
  if (reportData.incidentDate instanceof Date) {
    (payload as any).incidentDate = reportData.incidentDate.toISOString();
  }
  const res = await fetch("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to submit report");
  }
  const data = (await res.json()) as { id?: string };
  return data.id ?? "";
}

/**
 * Get commuter's report history via API (server-side, bypasses Firestore rules)
 */
export async function getCommuterReportHistoryViaAPI(
  commuterId: string
): Promise<ReportCase[]> {
  const res = await fetch("/api/user/reports", { credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to fetch reports");
  }
  const data = (await res.json()) as any[];
  return data.map((d) => ({
    id: d.id,
    commuterId: d.commuterId,
    commuterName: d.commuterName,
    commuterEmail: d.commuterEmail,
    phoneNumber: d.phoneNumber,
    reportType: d.reportType,
    description: d.description,
    driverId: d.driverId,
    vehicleNumber: d.vehicleNumber,
    plateNumber: d.plateNumber,
    location: d.location,
    incidentDate: d.incidentDate ? new Date(d.incidentDate) : undefined,
    createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
    status: d.status || "pending",
    imageUrls: d.imageUrls,
    driverName: d.driverName,
  }));
}

/**
 * Delete report via API (server-side, bypasses Firestore rules)
 */
export async function deleteReportViaAPI(reportId: string): Promise<void> {
  const res = await fetch(`/api/user/reports?id=${encodeURIComponent(reportId)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to delete report");
  }
}

/**
 * Get all report cases for a specific commuter (client-side Firestore)
 */
export async function getCommuterReportHistory(
  commuterId: string
): Promise<ReportCase[]> {
  try {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      where("commuterId", "==", commuterId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const reports: ReportCase[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        commuterId: data.commuterId,
        commuterName: data.commuterName,
        commuterEmail: data.commuterEmail,
        phoneNumber: data.phoneNumber,
        reportType: data.reportType,
        description: data.description,
        driverId: data.driverId,
        vehicleNumber: data.vehicleNumber,
        plateNumber: data.plateNumber,
        location: data.location,
        incidentDate: data.incidentDate?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status || "pending",
        imageUrls: data.imageUrls,
      });
    });

    return reports;
  } catch (error) {
    console.error("Error fetching report history:", error);
    throw new Error("Failed to fetch report history");
  }
}

/**
 * Get reports for a driver via API (server-side, for driver account)
 */
export async function getDriverReportsViaAPI(): Promise<ReportCase[]> {
  const res = await fetch("/api/driver/reports", { credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to fetch reports");
  }
  const data = (await res.json()) as any[];
  return data.map((d) => ({
    id: d.id,
    commuterId: d.commuterId,
    commuterName: d.commuterName,
    commuterEmail: d.commuterEmail,
    phoneNumber: d.phoneNumber,
    reportType: d.reportType,
    description: d.description,
    driverId: d.driverId,
    driverName: d.driverName,
    vehicleNumber: d.vehicleNumber,
    plateNumber: d.plateNumber,
    location: d.location,
    incidentDate: d.incidentDate ? new Date(d.incidentDate) : undefined,
    createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
    status: d.status || "pending",
    imageUrls: d.imageUrls,
  }));
}

/**
 * Get all report cases for a specific driver
 */
export async function getDriverReports(
  driverId: string
): Promise<ReportCase[]> {
  try {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      where("driverId", "==", driverId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const reports: ReportCase[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        commuterId: data.commuterId,
        commuterName: data.commuterName,
        commuterEmail: data.commuterEmail,
        phoneNumber: data.phoneNumber,
        reportType: data.reportType,
        description: data.description,
        driverId: data.driverId,
        vehicleNumber: data.vehicleNumber,
        plateNumber: data.plateNumber,
        location: data.location,
        incidentDate: data.incidentDate?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status || "pending",
        imageUrls: data.imageUrls,
      });
    });

    return reports;
  } catch (error) {
    console.error("Error fetching driver reports:", error);
    throw new Error("Failed to fetch driver reports");
  }
}

/**
 * Get all report cases (admin view)
 */
export async function getAllReportCases(): Promise<ReportCase[]> {
  try {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const reports: ReportCase[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        commuterId: data.commuterId,
        commuterName: data.commuterName,
        commuterEmail: data.commuterEmail,
        phoneNumber: data.phoneNumber,
        reportType: data.reportType,
        description: data.description,
        driverId: data.driverId,
        vehicleNumber: data.vehicleNumber,
        plateNumber: data.plateNumber,
        location: data.location,
        incidentDate: data.incidentDate?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status || "pending",
      });
    });

    return reports;
  } catch (error) {
    console.error("Error fetching all reports:", error);
    throw new Error("Failed to fetch reports");
  }
}

/**
 * Update the status of a report case
 */
export async function updateReportStatus(
  reportId: string,
  status: "pending" | "investigating" | "resolved"
): Promise<void> {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    await updateDoc(reportRef, { status });
  } catch (error) {
    console.error("Error updating report status:", error);
    throw new Error("Failed to update report status");
  }
}

/**
 * Delete a report case (only if status is pending)
 */
export async function deleteReport(reportId: string): Promise<void> {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    await deleteDoc(reportRef);
  } catch (error) {
    console.error("Error deleting report:", error);
    throw new Error("Failed to delete report");
  }
}
