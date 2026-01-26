import { useEffect } from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import { supabase } from "../lib/supabase";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event, "Path:", pathname);
      
      if (event === "SIGNED_IN" && session) {
        console.log("✅ User signed in:", session.user.email);
        // Don't auto-navigate here - let callback screen handle it
        
      } else if (event === "SIGNED_OUT") {
        console.log("👋 User signed out");
        // Only redirect to index if not already there
        if (pathname !== "/") {
          router.replace("/");
        }
        
      } else if (event === "TOKEN_REFRESHED") {
        console.log("🔄 Token refreshed");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [pathname]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
