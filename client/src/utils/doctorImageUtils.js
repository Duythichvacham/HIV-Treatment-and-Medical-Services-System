const images = import.meta.glob("/src/assets/doctors/*.png", { eager: true });

export function getDoctorImage(image_url) {
  if (!image_url) return "/assets/doctors/default.png";
  return images[`/src/assets/doctors/${image_url}`]?.default;
}
