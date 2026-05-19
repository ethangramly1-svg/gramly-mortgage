-- No-op for fresh installs. The reference architecture originally
-- shipped without CRM fields and added them in this migration; this
-- repo's 0001 already includes them. Kept as a tracking entry so
-- _migrations stays in lockstep between the two shapes of the schema.

SELECT 1;
