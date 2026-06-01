-- Keep the current public selection rule deterministic before adding the guard.
-- If legacy data has multiple published offers, preserve the same offer
-- resolveActiveOffer would have picked and move the rest back to draft.
WITH ranked_published_offers AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY tenant_id, variant_id, collection_key
      ORDER BY
        CASE WHEN expired_at IS NULL OR expired_at > NOW() THEN 0 ELSE 1 END ASC,
        is_featured DESC,
        sort_order ASC,
        published_at DESC NULLS LAST,
        updated_at DESC,
        id ASC
    ) AS row_number
  FROM content_items
  WHERE collection_key = 'offer'
    AND status = 'PUBLISHED'
)
UPDATE content_items
SET status = 'DRAFT',
    updated_at = NOW()
FROM ranked_published_offers
WHERE content_items.id = ranked_published_offers.id
  AND ranked_published_offers.row_number > 1;

-- Enforce that each tenant variant has at most one published offer.
CREATE UNIQUE INDEX "content_items_one_published_offer_per_variant_key"
ON "content_items"("tenant_id", "variant_id", "collection_key")
WHERE "collection_key" = 'offer' AND "status" = 'PUBLISHED';
