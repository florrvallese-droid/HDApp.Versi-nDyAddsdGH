import { supabase } from "./supabase";
import { toast } from "sonner";

export const uploadCheckinPhoto = async (userId: string, file: File, type: 'front' | 'side' | 'back') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}_${type}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('checkin_photos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL (or signed URL if private, but for now assuming we can use path)
    // Actually, typically we store the path and generate signed URLs on display if bucket is private.
    // For MVP simplicity, we'll return the path.
    return { path: data?.path, error: null };
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    toast.error(`Error uploading ${type} photo: ${error.message}`);
    return { path: null, error };
  }
};