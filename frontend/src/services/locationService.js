import { supabase } from "../lib/supabase";

// Save or Update monitored location
export async function saveMonitoredLocation(latitude, longitude, locationName = null) {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) throw new Error("User not logged in.");

  const userId = userData.user.id;

  const { error } = await supabase
    .from("monitored_locations")
    .upsert(
      {
        user_id: userId,
        latitude,
        longitude,
        location_name: locationName,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) throw error;
}

// Load monitored location
export async function getMonitoredLocation() {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("monitored_locations")
    .select("*")
    .eq("user_id", userData.user.id)
    .single();

  if (error) return null;

  return data;
}
