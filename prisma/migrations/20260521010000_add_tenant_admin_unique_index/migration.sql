-- Enforce the MVP rule at the database level:
-- one tenant can have at most one TENANT_ADMIN user.
CREATE UNIQUE INDEX "users_one_tenant_admin_per_tenant_key"
ON "users"("tenant_id")
WHERE "role" = 'TENANT_ADMIN' AND "tenant_id" IS NOT NULL;
