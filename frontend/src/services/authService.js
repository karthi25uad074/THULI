import { supabase } from "../lib/supabase";

// Register
export async function registerUser({
  name,
  email,
  password,
  phone
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone
      }
    }
  });

  if (error) throw error;

  return data;
}

// Login
export async function loginUser(email, password) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error) throw error;

  return data;
}

// Logout
export async function logoutUser() {
  await supabase.auth.signOut();
}

// Current User
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}