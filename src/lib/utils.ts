import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { supabase } from "./supabase";

export const fetcher = async (url: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    }
  });

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    // @ts-ignore
    error.info = await res.json().catch(() => ({}))
    // @ts-ignore
    error.status = res.status
    throw error
  }
  return res.json()
}
