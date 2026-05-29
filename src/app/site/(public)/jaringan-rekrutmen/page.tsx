import { redirect } from "next/navigation";

export const revalidate = 3600;

export default async function JaringanRekrutmenPage() {
  redirect("/recruitment-network");
}
