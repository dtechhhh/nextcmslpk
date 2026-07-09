import { revalidatePath } from "next/cache";

export function revalidateTenantManagement(tenantId: string) {
  revalidatePath("/super-admin");
  revalidatePath("/super-admin/tenants");
  revalidatePath(`/super-admin/tenants/${tenantId}`);
  revalidatePath("/site");
}
