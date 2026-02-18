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

export interface Commendation {
  id: string;
  commuterId: string;
  commuterName: string;
  commuterEmail: string;
  phoneNumber?: string;
  driverId: string;
  driverName?: string;
  vehicleNumber?: string;
  plateNumber?: string;
  rating: number;
  comment: string;
  commendationType: string;
  createdAt: Date;
}

export interface CommendationInput {
  commuterId: string;
  commuterName: string;
  commuterEmail: string;
  phoneNumber?: string;
  driverId: string;
  driverName?: string;
  vehicleNumber?: string;
  plateNumber?: string;
  rating: number;
  comment: string;
  commendationType: string;
}

const COMMENDATIONS_COLLECTION = "commendations";

/**
 * Submit a new commendation for a driver (client-side Firestore)
 */
export async function submitCommendation(
  commendationData: CommendationInput
): Promise<string> {
  try {
    const dataToSave = Object.fromEntries(
      Object.entries(commendationData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, COMMENDATIONS_COLLECTION), {
      ...dataToSave,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error submitting commendation:", error);
    throw new Error("Failed to submit commendation");
  }
}

/**
 * Submit commendation via API (server-side, bypasses Firestore rules)
 */
export async function submitCommendationViaAPI(
  commendationData: CommendationInput
): Promise<string> {
  const res = await fetch("/api/commendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(commendationData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to submit commendation");
  }
  const data = (await res.json()) as { id?: string };
  return data.id ?? "";
}

/**
 * Get commuter's commendations via API (server-side, bypasses Firestore rules)
 */
export async function getCommuterCommendationsViaAPI(
  commuterId: string
): Promise<Commendation[]> {
  const res = await fetch("/api/user/commendations", { credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to fetch commendations");
  }
  const data = (await res.json()) as any[];
  return data.map((d) => ({
    id: d.id,
    commuterId: d.commuterId,
    commuterName: d.commuterName,
    commuterEmail: d.commuterEmail,
    phoneNumber: d.phoneNumber,
    driverId: d.driverId,
    driverName: d.driverName,
    vehicleNumber: d.vehicleNumber,
    plateNumber: d.plateNumber,
    rating: d.rating,
    comment: d.comment,
    commendationType: d.commendationType,
    createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
  }));
}

/**
 * Get all commendations submitted by a specific commuter (client-side Firestore)
 */
export async function getCommuterCommendations(
  commuterId: string
): Promise<Commendation[]> {
  try {
    const q = query(
      collection(db, COMMENDATIONS_COLLECTION),
      where("commuterId", "==", commuterId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const commendations: Commendation[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      commendations.push({
        id: doc.id,
        commuterId: data.commuterId,
        commuterName: data.commuterName,
        commuterEmail: data.commuterEmail,
        phoneNumber: data.phoneNumber,
        driverId: data.driverId,
        driverName: data.driverName,
        vehicleNumber: data.vehicleNumber,
        plateNumber: data.plateNumber,
        rating: data.rating,
        comment: data.comment,
        commendationType: data.commendationType,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    return commendations;
  } catch (error) {
    console.error("Error fetching commendations:", error);
    throw new Error("Failed to fetch commendations");
  }
}

/**
 * Get commendations for a driver via API (server-side, for driver account)
 */
export async function getDriverCommendationsViaAPI(): Promise<Commendation[]> {
  const res = await fetch("/api/driver/commendations", { credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to fetch commendations");
  }
  const data = (await res.json()) as any[];
  return data.map((d) => ({
    id: d.id,
    commuterId: d.commuterId,
    commuterName: d.commuterName,
    commuterEmail: d.commuterEmail,
    phoneNumber: d.phoneNumber,
    driverId: d.driverId,
    driverName: d.driverName,
    vehicleNumber: d.vehicleNumber,
    plateNumber: d.plateNumber,
    rating: d.rating,
    comment: d.comment,
    commendationType: d.commendationType,
    createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
  }));
}

/**
 * Get all commendations for a specific driver (admin view)
 */
export async function getDriverCommendations(
  driverId: string
): Promise<Commendation[]> {
  try {
    const q = query(
      collection(db, COMMENDATIONS_COLLECTION),
      where("driverId", "==", driverId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const commendations: Commendation[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      commendations.push({
        id: doc.id,
        commuterId: data.commuterId,
        commuterName: data.commuterName,
        commuterEmail: data.commuterEmail,
        phoneNumber: data.phoneNumber,
        driverId: data.driverId,
        driverName: data.driverName,
        vehicleNumber: data.vehicleNumber,
        plateNumber: data.plateNumber,
        rating: data.rating,
        comment: data.comment,
        commendationType: data.commendationType,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    return commendations;
  } catch (error) {
    console.error("Error fetching driver commendations:", error);
    throw new Error("Failed to fetch commendations");
  }
}

/**
 * Get all commendations (admin view)
 */
export async function getAllCommendations(): Promise<Commendation[]> {
  try {
    const q = query(
      collection(db, COMMENDATIONS_COLLECTION),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const commendations: Commendation[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      commendations.push({
        id: doc.id,
        commuterId: data.commuterId,
        commuterName: data.commuterName,
        commuterEmail: data.commuterEmail,
        phoneNumber: data.phoneNumber,
        driverId: data.driverId,
        driverName: data.driverName,
        vehicleNumber: data.vehicleNumber,
        plateNumber: data.plateNumber,
        rating: data.rating,
        comment: data.comment,
        commendationType: data.commendationType,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    return commendations;
  } catch (error) {
    console.error("Error fetching all commendations:", error);
    throw new Error("Failed to fetch commendations");
  }
}
