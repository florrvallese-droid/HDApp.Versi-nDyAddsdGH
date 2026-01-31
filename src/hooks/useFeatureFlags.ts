import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";

export function useFeatureFlags() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlags();
    
    // Subscribe to changes for real-time updates
    const channel = supabase
      .channel('public:feature_flags')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feature_flags' }, () => {
        fetchFlags();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('key, is_enabled');

      if (error) throw error;

      const flagMap: Record<string, boolean> = {};
      data?.forEach(f => {
        flagMap[f.key] = f.is_enabled;
      });

      setFlags(flagMap);
    } catch (err) {
      console.error("Error fetching flags:", err);
    } finally {
      setLoading(false);
    }
  };

  return { flags, loading };
}