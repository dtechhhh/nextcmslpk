import type { Session } from "next-auth";

import { AuthError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/server/db/client";

type AnyArgs = Record<string, unknown>;
type AnyRecord = Record<string, unknown>;

type CrudShape = {
  findUnique: unknown;
  findUniqueOrThrow: unknown;
  findFirst: unknown;
  findFirstOrThrow: unknown;
  findMany: unknown;
  count: unknown;
  create: unknown;
  update: unknown;
  delete: unknown;
};

type ScopedCrud<T extends CrudShape> = Pick<
  T,
  | "findUnique"
  | "findUniqueOrThrow"
  | "findFirst"
  | "findFirstOrThrow"
  | "findMany"
  | "count"
  | "create"
  | "update"
  | "delete"
>;

type ScopedDelegate = {
  findFirst(args: AnyArgs): Promise<unknown>;
  findMany(args?: AnyArgs): Promise<unknown>;
  count(args?: AnyArgs): Promise<unknown>;
  create(args: AnyArgs): Promise<unknown>;
  update(args: AnyArgs): Promise<unknown>;
  delete(args: AnyArgs): Promise<unknown>;
};

type ScopedModelOptions = {
  resource: string;
  scopeWhere?: (where: AnyRecord | undefined, tenantId: string) => AnyRecord;
  scopeWriteWhere?: (where: AnyRecord, tenantId: string) => AnyRecord;
  prepareCreateData?: (data: unknown, tenantId: string) => unknown | Promise<unknown>;
  prepareUpdateData?: (data: unknown, tenantId: string) => unknown | Promise<unknown>;
  validateCreateData?: (data: unknown, tenantId: string) => Promise<void>;
  validateUpdateData?: (data: unknown, tenantId: string) => Promise<void>;
};

export function tenantDb(session: Session) {
  const tenantId = session.user?.tenantId;

  if (!tenantId) {
    throw new AuthError("No tenant context");
  }

  return {
    contentPage: createScopedModel(prisma.contentPage, tenantId, {
      resource: "ContentPage",
      validateCreateData: validateVariantData,
      validateUpdateData: validateVariantData,
    }) as unknown as ScopedCrud<typeof prisma.contentPage>,

    contentItem: createScopedModel(prisma.contentItem, tenantId, {
      resource: "ContentItem",
      validateCreateData: validateContentItemData,
      validateUpdateData: validateContentItemData,
    }) as unknown as ScopedCrud<typeof prisma.contentItem>,

    contentCollection: createScopedModel(prisma.contentCollection, tenantId, {
      resource: "ContentCollection",
      validateCreateData: validateVariantData,
      validateUpdateData: validateVariantData,
    }) as unknown as ScopedCrud<typeof prisma.contentCollection>,

    variant: createScopedModel(prisma.variant, tenantId, {
      resource: "Variant",
    }) as unknown as ScopedCrud<typeof prisma.variant>,

    mediaAsset: createScopedModel(prisma.mediaAsset, tenantId, {
      resource: "MediaAsset",
    }) as unknown as ScopedCrud<typeof prisma.mediaAsset>,

    optionSet: createScopedModel(prisma.optionSet, tenantId, {
      resource: "OptionSet",
      validateCreateData: validateVariantData,
      validateUpdateData: validateVariantData,
    }) as unknown as ScopedCrud<typeof prisma.optionSet>,

    optionValue: createScopedModel(prisma.optionValue, tenantId, {
      resource: "OptionValue",
      scopeWhere: scopeOptionValueWhere,
      scopeWriteWhere: scopeOptionValueWriteWhere,
      prepareCreateData: cloneRecord,
      prepareUpdateData: cloneRecord,
      validateCreateData: validateOptionValueData,
      validateUpdateData: validateOptionValueData,
    }) as unknown as ScopedCrud<typeof prisma.optionValue>,

    variantGlobalConfig: createScopedModel(prisma.variantGlobalConfig, tenantId, {
      resource: "VariantGlobalConfig",
      validateCreateData: validateVariantData,
      validateUpdateData: validateVariantData,
    }) as unknown as ScopedCrud<typeof prisma.variantGlobalConfig>,
  };
}

function createScopedModel(
  delegate: unknown,
  tenantId: string,
  {
    resource,
    scopeWhere = scopeTenantWhere,
    scopeWriteWhere = scopeTenantWriteWhere,
    prepareCreateData = injectTenantCreateData,
    prepareUpdateData = sanitizeTenantUpdateData,
    validateCreateData,
    validateUpdateData,
  }: ScopedModelOptions,
) {
  const model = delegate as ScopedDelegate;

  async function findUnique(args: AnyArgs) {
    const where = getWhere(args);

    return model.findFirst({
      ...args,
      where: scopeWhere(where, tenantId),
    });
  }

  async function findFirst(args: AnyArgs = {}) {
    return model.findFirst({
      ...args,
      where: scopeWhere(getWhere(args), tenantId),
    });
  }

  async function findUniqueOrThrow(args: AnyArgs) {
    const record = await findUnique(args);

    if (!record) {
      throw new NotFoundError(resource);
    }

    return record;
  }

  async function findFirstOrThrow(args: AnyArgs = {}) {
    const record = await findFirst(args);

    if (!record) {
      throw new NotFoundError(resource);
    }

    return record;
  }

  return {
    findUnique,
    findUniqueOrThrow,
    findFirst,
    findFirstOrThrow,
    findMany(args: AnyArgs = {}) {
      return model.findMany({
        ...args,
        where: scopeWhere(getWhere(args), tenantId),
      });
    },
    count(args: AnyArgs = {}) {
      return model.count({
        ...args,
        where: scopeWhere(getWhere(args), tenantId),
      });
    },
    async create(args: AnyArgs) {
      const data = await prepareCreateData(args.data, tenantId);

      if (validateCreateData) {
        await validateCreateData(data, tenantId);
      }

      return model.create({
        ...args,
        data,
      });
    },
    async update(args: AnyArgs) {
      const where = getRequiredWhere(args, resource);
      await assertOwned(model, resource, where, tenantId, scopeWhere);

      const data = await prepareUpdateData(args.data, tenantId);

      if (validateUpdateData) {
        await validateUpdateData(data, tenantId);
      }

      return model.update({
        ...args,
        where: scopeWriteWhere(where, tenantId),
        data,
      });
    },
    async delete(args: AnyArgs) {
      const where = getRequiredWhere(args, resource);
      await assertOwned(model, resource, where, tenantId, scopeWhere);

      return model.delete({
        ...args,
        where: scopeWriteWhere(where, tenantId),
      });
    },
  };
}

async function assertOwned(
  model: ScopedDelegate,
  resource: string,
  where: AnyRecord | undefined,
  tenantId: string,
  scopeWhere: (where: AnyRecord | undefined, tenantId: string) => AnyRecord,
) {
  if (!where) {
    throw new NotFoundError(resource);
  }

  const record = await model.findFirst({
    where: scopeWhere(where, tenantId),
    select: { id: true },
  });

  if (!record) {
    throw new NotFoundError(resource);
  }
}

function scopeTenantWhere(where: AnyRecord | undefined, tenantId: string) {
  return andWhere(where, { tenantId });
}

function scopeTenantWriteWhere(where: AnyRecord, tenantId: string) {
  return {
    ...where,
    tenantId,
  };
}

function scopeOptionValueWhere(where: AnyRecord | undefined, tenantId: string) {
  return andWhere(where, {
    optionSet: {
      tenantId,
    },
  });
}

function scopeOptionValueWriteWhere(where: AnyRecord, tenantId: string) {
  return {
    ...where,
    optionSet: {
      tenantId,
    },
  };
}

function andWhere(where: AnyRecord | undefined, scopedWhere: AnyRecord) {
  if (!where || Object.keys(where).length === 0) {
    return scopedWhere;
  }

  return {
    AND: [where, scopedWhere],
  };
}

function getWhere(args: AnyArgs | undefined) {
  const where = args?.where;

  return isRecord(where) ? where : undefined;
}

function getRequiredWhere(args: AnyArgs | undefined, resource: string) {
  const where = getWhere(args);

  if (!where) {
    throw new NotFoundError(resource);
  }

  return where;
}

function injectTenantCreateData(data: unknown, tenantId: string) {
  const record = cloneRecord(data);

  if (usesCheckedRelations(record)) {
    delete record.tenantId;
    record.tenant = {
      connect: { id: tenantId },
    };

    return record;
  }

  delete record.tenant;
  record.tenantId = tenantId;

  return record;
}

function sanitizeTenantUpdateData(data: unknown, tenantId: string) {
  const record = cloneRecord(data);

  delete record.tenant;

  if ("tenantId" in record) {
    record.tenantId = tenantId;
  }

  return record;
}

function cloneRecord(data: unknown) {
  if (!isRecord(data)) {
    return {};
  }

  return { ...data };
}

function usesCheckedRelations(record: AnyRecord) {
  return ["tenant", "variant", "editor", "thumbnailImage", "heroImage"].some(
    (key) => key in record,
  );
}

async function validateContentItemData(data: unknown, tenantId: string) {
  await validateVariantData(data, tenantId);
  await validateMediaAssetData(data, tenantId);
}

async function validateVariantData(data: unknown, tenantId: string) {
  const record = cloneRecord(data);
  const variantId = getStringMutationField(record, "variantId");

  if (variantId) {
    await assertVariantOwnedByTenant(variantId, tenantId);
  }

  const connect = getNestedConnect(record, "variant");

  if (connect) {
    await assertVariantConnectOwnedByTenant(connect, tenantId);
  }
}

async function validateMediaAssetData(data: unknown, tenantId: string) {
  const record = cloneRecord(data);
  const mediaIds = new Set(
    ["thumbnailImageId", "heroImageId"]
      .map((key) => getStringMutationField(record, key))
      .filter((value): value is string => Boolean(value)),
  );

  for (const relationKey of ["thumbnailImage", "heroImage"]) {
    const connect = getNestedConnect(record, relationKey);
    const mediaId = getIdFromConnect(connect);

    if (mediaId) {
      mediaIds.add(mediaId);
    }
  }

  for (const mediaId of mediaIds) {
    await assertMediaOwnedByTenant(mediaId, tenantId);
  }
}

async function validateOptionValueData(data: unknown, tenantId: string) {
  const record = cloneRecord(data);
  const optionSetId = getStringMutationField(record, "optionSetId");

  if (optionSetId) {
    await assertOptionSetOwnedByTenant(optionSetId, tenantId);
  }

  const connect = getNestedConnect(record, "optionSet");

  if (connect) {
    await assertOptionSetConnectOwnedByTenant(connect, tenantId);
  }
}

async function assertVariantConnectOwnedByTenant(
  connect: AnyRecord,
  tenantId: string,
) {
  const id = getIdFromConnect(connect);

  if (id) {
    await assertVariantOwnedByTenant(id, tenantId);
    return;
  }

  const compound = getNestedRecord(connect, "tenantId_key");

  if (compound && compound.tenantId !== tenantId) {
    throw new ForbiddenError("Variant does not belong to tenant");
  }
}

async function assertOptionSetConnectOwnedByTenant(
  connect: AnyRecord,
  tenantId: string,
) {
  const id = getIdFromConnect(connect);

  if (id) {
    await assertOptionSetOwnedByTenant(id, tenantId);
    return;
  }

  const compound = getNestedRecord(connect, "variantId_key");
  const variantId = typeof compound?.variantId === "string" ? compound.variantId : null;
  const key = typeof compound?.key === "string" ? compound.key : null;

  if (!variantId || !key) {
    return;
  }

  const optionSet = await prisma.optionSet.findFirst({
    where: {
      tenantId,
      variantId,
      key,
    },
    select: { id: true },
  });

  if (!optionSet) {
    throw new ForbiddenError("Option set does not belong to tenant");
  }
}

async function assertVariantOwnedByTenant(variantId: string, tenantId: string) {
  const variant = await prisma.variant.findFirst({
    where: {
      id: variantId,
      tenantId,
    },
    select: { id: true },
  });

  if (!variant) {
    throw new ForbiddenError("Variant does not belong to tenant");
  }
}

async function assertOptionSetOwnedByTenant(optionSetId: string, tenantId: string) {
  const optionSet = await prisma.optionSet.findFirst({
    where: {
      id: optionSetId,
      tenantId,
    },
    select: { id: true },
  });

  if (!optionSet) {
    throw new ForbiddenError("Option set does not belong to tenant");
  }
}

async function assertMediaOwnedByTenant(mediaId: string, tenantId: string) {
  const media = await prisma.mediaAsset.findFirst({
    where: {
      id: mediaId,
      tenantId,
    },
    select: { id: true },
  });

  if (!media) {
    throw new ForbiddenError("Media asset does not belong to tenant");
  }
}

function getStringMutationField(record: AnyRecord, key: string) {
  const value = record[key];

  if (typeof value === "string") {
    return value;
  }

  if (!isRecord(value)) {
    return null;
  }

  return typeof value.set === "string" ? value.set : null;
}

function getNestedConnect(record: AnyRecord, relationKey: string) {
  const relation = record[relationKey];

  if (!isRecord(relation)) {
    return null;
  }

  return getNestedRecord(relation, "connect");
}

function getNestedRecord(record: AnyRecord | null, key: string) {
  const value = record?.[key];

  return isRecord(value) ? value : null;
}

function getIdFromConnect(connect: AnyRecord | null) {
  const id = connect?.id;

  return typeof id === "string" ? id : null;
}

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
