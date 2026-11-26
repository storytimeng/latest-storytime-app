import useSWRMutation from "swr/mutation";
import { uploadControllerUploadImage } from "../client/sdk.gen";
import { showToast } from "@/lib/showNotification";
import { compressImageFile } from "../lib/compressImage";

export function useImageUpload(folder?: string) {
  const { trigger, isMutating } = useSWRMutation(
    "upload-image",
    async (_key: string, { arg: file }: { arg: File }) => {
      const compressedFile = await compressImageFile(file);
      const response = await uploadControllerUploadImage({
        query: folder ? { folder } : undefined,
        body: {
            file: compressedFile
        }
      });

      if (response.error) {
        throw response.error;
      }

      return response.data;
    }
  );

  const upload = async (file: File): Promise<string | null> => {
    try {
      const result = await trigger(file);
        // Handle potential nested data structure if needed, similar to other hooks
        const data = (result as any).data || result;
      return data?.url || null;
    } catch (error) {
      console.error("Failed to upload image:", error);
      showToast({
        type: "error",
        message: "Failed to upload image. Please try again.",
      });
      throw error;
    }
  };

  return {
    upload,
    isUploading: isMutating,
  };
}
