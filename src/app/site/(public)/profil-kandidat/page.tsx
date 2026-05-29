import { redirect } from "next/navigation";

export const revalidate = 3600;

export default async function ProfilKandidatPage() {
  redirect("/candidate-profile");
}
