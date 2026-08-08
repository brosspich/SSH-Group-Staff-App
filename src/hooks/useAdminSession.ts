import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";

interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  system_id: string;
  role: string;
}

let _cached: AdminUser | null = null;

export function useAdminSession() {
  const [admin, setAdmin] = useState<AdminUser | null>(_cached);
  const [loading, setLoading] = useState(!_cached);

  useEffect(() => {
    if (_cached) return;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("pos_admin_user_2")
        .select(
          "id, name, system_id, role, username, email, phone, is_active, created_at, devices",
        )
        .eq("email", user.email)
        .maybeSingle();

      if (data) {
        _cached = data;
        setAdmin(data);
      }
      setLoading(false);
    })();
  }, []);

  return { admin, loading };
}
