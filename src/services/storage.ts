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

    return { path: data?.path, error: null };
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    toast.error(`Error uploading ${type} photo: ${error.message}`);
    return { path: null, error };
  }
};

export const uploadBrandLogo = async (userId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/brand_logo_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars') // Reutilizamos el bucket de avatars para assets de perfil
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading logo:', error);
    return { url: null, error };
  }
};