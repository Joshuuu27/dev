export interface Trip {
  id: string;
  userId: string;
  fromAddress: string;
  fromCoords?: { lat: number; lng: number };
  toAddress: string;
  toCoords?: { lat: number; lng: number };
  fare: number | null;
  status: "ongoing" | "completed" | "cancelled";
  createdAt: string | Date;
  completedAt?: string | Date;
  startedAt: number;
  duration?: string;
  distance?: string;
}

/**
 * Save a new trip when tracking starts (via API so session cookie is used – no client Firestore auth needed)
 */
export async function saveTrip(
  fromAddress: string,
  fromCoords: { lat: number; lng: number } | null,
  toAddress: string,
  toCoords: { lat: number; lng: number } | null,
  fare: number | null,
  _authUserId?: string | null
): Promise<string> {
  try {
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fromAddress,
        fromCoords: fromCoords || null,
        toAddress,
        toCoords: toCoords || null,
        fare: fare ?? null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error("User not authenticated");
      }
      throw new Error(data.error || "Failed to save trip");
    }

    const data = await res.json();
    return data.id;
  } catch (error) {
    console.error("Error saving trip:", error);
    throw error;
  }
}

/**
 * Mark a trip as completed when tracking stops (via API)
 */
export async function completeTrip(tripId: string): Promise<void> {
  try {
    const res = await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to complete trip");
    }
  } catch (error) {
    console.error("Error completing trip:", error);
    throw error;
  }
}

/**
 * Get all trips for the current user (via API so no client Firestore permission needed)
 */
export async function getUserTrips(): Promise<Trip[]> {
  try {
    const res = await fetch("/api/trips", { credentials: "include" });
    if (res.status === 401) {
      throw new Error("User not authenticated");
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to fetch trips");
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching user trips:", error);
    throw error;
  }
}
