import { z } from "zod";

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const imageType = z
  .string()
  .refine(
    (type) => ACCEPTED_IMAGE_TYPES.includes(type),
    "Only .jpg, .jpeg, .png and .webp formats are supported.",
  );

// https://stackoverflow.com/a/38935990/12128483
export function base64ToFile(dataurl: string, filename: string) {
  const arr = dataurl.split(",");
  const mime = arr[0]!.match(/:(.*?);/)![1];
  const bstr = atob(arr[arr.length - 1]!);
  const u8arr = new Uint8Array(bstr.length);
  for (let n = bstr.length; n > 0; n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// https://stackoverflow.com/a/24289420/12128483
export function removeDataURL(str: string) {
  return str.split(",")[1]!;
}

// found this somewhere online lmao too bad i forgot where
export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result as string);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}
