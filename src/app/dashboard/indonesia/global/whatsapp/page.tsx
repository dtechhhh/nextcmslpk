import { GlobalConfigEditorPage } from "@/components/dashboard/global-config-editor-page";

export const dynamic = "force-dynamic";

export default async function IndonesiaWhatsappPage() {
  return GlobalConfigEditorPage({ definitionKey: "indonesia.whatsapp_contact" });
}

