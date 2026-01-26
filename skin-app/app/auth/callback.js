import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No session in callback, redirecting to login");
        router.replace("/");
        return;
      }

      console.log("✅ [CALLBACK] Session found:", session.user.email);
      console.log("🔍 [CALLBACK] User ID:", session.user.id);

      // Check if profile exists and quiz completion status
      const userId = session.user.id;
      console.log("🔍 [CALLBACK] Querying profiles table for id:", userId);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('quiz_completed')
        .eq('id', userId)
        .single();

      console.log("🔍 [CALLBACK] Query result:");
      console.log("  - Profile:", profile);
      console.log("  - Error:", profileError);

      if (profileError) {
        console.log("⚠️ [CALLBACK] Profile doesn't exist, creating new profile...");
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ id: userId, quiz_completed: false })
          .select()
          .single();
        
        console.log("🔍 [CALLBACK] Create profile result:");
        console.log("  - New profile:", newProfile);
        console.log("  - Error:", createError);
        
        // Route to quiz
        console.log("➡️ [CALLBACK] New user → routing to /quiz");
        router.replace("/quiz");
        return;
      }

      // Route based on quiz completion
      console.log("🔍 [CALLBACK] quiz_completed value:", profile?.quiz_completed);
      console.log("🔍 [CALLBACK] Type:", typeof profile?.quiz_completed);
      
      if (profile?.quiz_completed === true) {
        console.log("✅ [CALLBACK] Quiz completed → routing to /profile");
        router.replace("/profile");
      } else {
        console.log("⏸️ [CALLBACK] Quiz not completed → routing to /quiz");
        router.replace("/quiz");
      }
    };

    handleCallback();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
      <Text>Signing you in…</Text>
    </View>
  );
}
