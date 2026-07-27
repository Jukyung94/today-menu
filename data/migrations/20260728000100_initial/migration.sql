CREATE TYPE "actor_kind" AS ENUM (
  'GUEST',
  'REGISTERED'
);

CREATE TYPE "recommendation_mode" AS ENUM (
  'GUIDED',
  'PERSONALIZED_RANDOM'
);

CREATE TYPE "recommendation_session_status" AS ENUM (
  'IN_PROGRESS',
  'COMPLETED',
  'ABANDONED',
  'EXPIRED'
);

CREATE TYPE "food_attribute_dimension" AS ENUM (
  'MEAL_FORM',
  'TASTE',
  'SITUATION',
  'BUDGET',
  'FEATURE'
);

CREATE TYPE "feedback_action_type" AS ENUM (
  'VIEWED',
  'SELECTED',
  'SAVED',
  'DISLIKED',
  'DO_NOT_RECOMMEND'
);

CREATE TYPE "meal_log_source" AS ENUM (
  'MANUAL',
  'RECOMMENDATION'
);

CREATE TYPE "upload_status" AS ENUM (
  'PENDING',
  'READY',
  'FAILED',
  'DELETED'
);

CREATE TABLE "actors" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "kind" "actor_kind" NOT NULL DEFAULT 'GUEST',
  "auth_provider" VARCHAR(50),
  "auth_subject" VARCHAR(255),
  "locale" VARCHAR(35) NOT NULL DEFAULT 'ko-KR',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_seen_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ(3),

  CONSTRAINT "actors_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "actors_auth_identity_pair_check"
    CHECK (("auth_provider" IS NULL) = ("auth_subject" IS NULL)),
  CONSTRAINT "actors_registered_identity_check"
    CHECK ("kind" <> 'REGISTERED' OR "auth_subject" IS NOT NULL)
);

CREATE UNIQUE INDEX "actors_auth_identity_key"
  ON "actors" ("auth_provider", "auth_subject");

CREATE TABLE "recommendation_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actor_id" UUID NOT NULL,
  "mode" "recommendation_mode" NOT NULL,
  "status" "recommendation_session_status" NOT NULL DEFAULT 'IN_PROGRESS',
  "version" INTEGER NOT NULL DEFAULT 1,
  "locale" VARCHAR(35) NOT NULL DEFAULT 'ko-KR',
  "context" JSONB NOT NULL,
  "ruleset_version" VARCHAR(50),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMPTZ(3) NOT NULL,
  "completed_at" TIMESTAMPTZ(3),

  CONSTRAINT "recommendation_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "recommendation_sessions_version_check" CHECK ("version" >= 1),
  CONSTRAINT "recommendation_sessions_context_check"
    CHECK (
      jsonb_typeof("context") = 'object'
      AND jsonb_typeof("context" -> 'contextVersion') = 'number'
      AND (("context" ->> 'contextVersion')::NUMERIC % 1) = 0
      AND ("context" ->> 'contextVersion')::INTEGER >= 1
    ),
  CONSTRAINT "recommendation_sessions_expires_check"
    CHECK ("expires_at" > "created_at"),
  CONSTRAINT "recommendation_sessions_completion_check"
    CHECK (
      ("status" = 'COMPLETED' AND "completed_at" IS NOT NULL AND "ruleset_version" IS NOT NULL)
      OR ("status" <> 'COMPLETED' AND "completed_at" IS NULL)
    )
);

CREATE INDEX "recommendation_sessions_actor_created_idx"
  ON "recommendation_sessions" ("actor_id", "created_at" DESC);

CREATE INDEX "recommendation_sessions_status_expires_idx"
  ON "recommendation_sessions" ("status", "expires_at");

CREATE TABLE "session_answers" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "question_key" VARCHAR(100) NOT NULL,
  "selected_values" JSONB NOT NULL,
  "session_version" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "session_answers_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "session_answers_question_key_check"
    CHECK (length(btrim("question_key")) > 0),
  CONSTRAINT "session_answers_selected_values_check"
    CHECK (
      jsonb_typeof("selected_values") = 'array'
      AND jsonb_array_length("selected_values") > 0
      AND NOT jsonb_path_exists(
        "selected_values",
        '$[*] ? (@.type() != "string" && @.type() != "number" && @.type() != "boolean")'
      )
    ),
  CONSTRAINT "session_answers_session_version_check"
    CHECK ("session_version" >= 1)
);

CREATE UNIQUE INDEX "session_answers_session_question_key"
  ON "session_answers" ("session_id", "question_key");

CREATE INDEX "session_answers_session_version_idx"
  ON "session_answers" ("session_id", "session_version");

CREATE TABLE "foods" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" VARCHAR(100) NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "category" VARCHAR(50) NOT NULL,
  "description" TEXT,
  "image_url" VARCHAR(2048),
  "estimated_price" INTEGER,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "foods_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "foods_slug_check"
    CHECK ("slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT "foods_name_check" CHECK (length(btrim("name")) > 0),
  CONSTRAINT "foods_category_check" CHECK (length(btrim("category")) > 0),
  CONSTRAINT "foods_estimated_price_check"
    CHECK ("estimated_price" IS NULL OR "estimated_price" >= 0)
);

CREATE UNIQUE INDEX "foods_slug_key" ON "foods" ("slug");

CREATE INDEX "foods_category_active_idx"
  ON "foods" ("category", "is_active");

CREATE TABLE "food_attributes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "food_id" UUID NOT NULL,
  "dimension" "food_attribute_dimension" NOT NULL,
  "value" VARCHAR(80) NOT NULL,
  "weight" DECIMAL(5, 2) NOT NULL DEFAULT 1,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "food_attributes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "food_attributes_value_check"
    CHECK ("value" ~ '^[A-Z][A-Z0-9_]*$'),
  CONSTRAINT "food_attributes_weight_check"
    CHECK ("weight" > 0)
);

CREATE UNIQUE INDEX "food_attributes_food_dimension_value"
  ON "food_attributes" ("food_id", "dimension", "value");

CREATE INDEX "food_attributes_dimension_value_food_idx"
  ON "food_attributes" ("dimension", "value", "food_id");

CREATE TABLE "recommendation_results" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "food_id" UUID NOT NULL,
  "rank" SMALLINT NOT NULL,
  "reason" TEXT NOT NULL,
  "matched_tags" JSONB NOT NULL,
  "estimated_price" INTEGER,
  "match_score" DECIMAL(5, 2) NOT NULL,
  "score_breakdown" JSONB NOT NULL,
  "context_snapshot" JSONB NOT NULL,
  "food_snapshot" JSONB NOT NULL,
  "ruleset_version" VARCHAR(50) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recommendation_results_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "recommendation_results_rank_check" CHECK ("rank" >= 1),
  CONSTRAINT "recommendation_results_reason_check"
    CHECK (length(btrim("reason")) > 0),
  CONSTRAINT "recommendation_results_matched_tags_check"
    CHECK (jsonb_typeof("matched_tags") = 'array'),
  CONSTRAINT "recommendation_results_estimated_price_check"
    CHECK ("estimated_price" IS NULL OR "estimated_price" >= 0),
  CONSTRAINT "recommendation_results_match_score_check"
    CHECK ("match_score" >= 0 AND "match_score" <= 100),
  CONSTRAINT "recommendation_results_score_breakdown_check"
    CHECK (jsonb_typeof("score_breakdown") = 'object'),
  CONSTRAINT "recommendation_results_context_snapshot_check"
    CHECK (
      jsonb_typeof("context_snapshot") = 'object'
      AND jsonb_typeof("context_snapshot" -> 'contextVersion') = 'number'
      AND (("context_snapshot" ->> 'contextVersion')::NUMERIC % 1) = 0
      AND ("context_snapshot" ->> 'contextVersion')::INTEGER >= 1
    ),
  CONSTRAINT "recommendation_results_food_snapshot_check"
    CHECK (jsonb_typeof("food_snapshot") = 'object'),
  CONSTRAINT "recommendation_results_ruleset_version_check"
    CHECK (length(btrim("ruleset_version")) > 0)
);

CREATE UNIQUE INDEX "recommendation_results_session_rank"
  ON "recommendation_results" ("session_id", "rank");

CREATE UNIQUE INDEX "recommendation_results_session_food"
  ON "recommendation_results" ("session_id", "food_id");

CREATE UNIQUE INDEX "recommendation_results_id_session"
  ON "recommendation_results" ("id", "session_id");

CREATE INDEX "recommendation_results_food_created_idx"
  ON "recommendation_results" ("food_id", "created_at" DESC);

CREATE TABLE "recommendation_feedback" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actor_id" UUID NOT NULL,
  "session_id" UUID NOT NULL,
  "recommendation_result_id" UUID NOT NULL,
  "action_type" "feedback_action_type" NOT NULL,
  "rating" SMALLINT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recommendation_feedback_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "recommendation_feedback_rating_check"
    CHECK ("rating" IS NULL OR ("rating" >= 1 AND "rating" <= 5))
);

CREATE INDEX "recommendation_feedback_result_created_idx"
  ON "recommendation_feedback" ("recommendation_result_id", "created_at");

CREATE INDEX "recommendation_feedback_actor_created_idx"
  ON "recommendation_feedback" ("actor_id", "created_at" DESC);

CREATE TABLE "meal_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actor_id" UUID NOT NULL,
  "recommendation_result_id" UUID,
  "food_id" UUID,
  "custom_food_name" VARCHAR(120),
  "source" "meal_log_source" NOT NULL DEFAULT 'MANUAL',
  "rating" SMALLINT NOT NULL,
  "note" TEXT,
  "eaten_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "meal_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "meal_logs_food_reference_check"
    CHECK (
      "recommendation_result_id" IS NOT NULL
      OR "food_id" IS NOT NULL
      OR length(btrim(COALESCE("custom_food_name", ''))) > 0
    ),
  CONSTRAINT "meal_logs_rating_check"
    CHECK ("rating" >= 1 AND "rating" <= 5),
  CONSTRAINT "meal_logs_source_check"
    CHECK (
      ("source" = 'RECOMMENDATION' AND "recommendation_result_id" IS NOT NULL)
      OR ("source" = 'MANUAL' AND "recommendation_result_id" IS NULL)
    )
);

CREATE INDEX "meal_logs_actor_eaten_idx"
  ON "meal_logs" ("actor_id", "eaten_at" DESC);

CREATE INDEX "meal_logs_recommendation_result_idx"
  ON "meal_logs" ("recommendation_result_id");

CREATE TABLE "uploaded_files" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actor_id" UUID NOT NULL,
  "storage_provider" VARCHAR(50) NOT NULL,
  "bucket" VARCHAR(100) NOT NULL,
  "object_key" VARCHAR(1024) NOT NULL,
  "original_name" VARCHAR(255),
  "content_type" VARCHAR(127) NOT NULL,
  "byte_size" BIGINT NOT NULL,
  "checksum_sha256" CHAR(64),
  "status" "upload_status" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ready_at" TIMESTAMPTZ(3),

  CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "uploaded_files_byte_size_check" CHECK ("byte_size" > 0),
  CONSTRAINT "uploaded_files_checksum_sha256_check"
    CHECK (
      "checksum_sha256" IS NULL
      OR btrim("checksum_sha256") ~ '^[0-9a-fA-F]{64}$'
    ),
  CONSTRAINT "uploaded_files_ready_status_check"
    CHECK (
      ("status" = 'READY' AND "ready_at" IS NOT NULL)
      OR ("status" <> 'READY' AND "ready_at" IS NULL)
    )
);

CREATE UNIQUE INDEX "uploaded_files_storage_object_key"
  ON "uploaded_files" ("storage_provider", "bucket", "object_key");

CREATE INDEX "uploaded_files_actor_created_idx"
  ON "uploaded_files" ("actor_id", "created_at" DESC);

CREATE TABLE "meal_log_photos" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "meal_log_id" UUID NOT NULL,
  "uploaded_file_id" UUID NOT NULL,
  "sort_order" SMALLINT NOT NULL DEFAULT 0,
  "caption" VARCHAR(300),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "meal_log_photos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "meal_log_photos_sort_order_check" CHECK ("sort_order" >= 0)
);

CREATE UNIQUE INDEX "meal_log_photos_meal_file"
  ON "meal_log_photos" ("meal_log_id", "uploaded_file_id");

CREATE UNIQUE INDEX "meal_log_photos_meal_sort_order"
  ON "meal_log_photos" ("meal_log_id", "sort_order");

ALTER TABLE "recommendation_sessions"
  ADD CONSTRAINT "recommendation_sessions_actor_id_fkey"
  FOREIGN KEY ("actor_id") REFERENCES "actors"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "session_answers"
  ADD CONSTRAINT "session_answers_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "recommendation_sessions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "food_attributes"
  ADD CONSTRAINT "food_attributes_food_id_fkey"
  FOREIGN KEY ("food_id") REFERENCES "foods"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recommendation_results"
  ADD CONSTRAINT "recommendation_results_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "recommendation_sessions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recommendation_results"
  ADD CONSTRAINT "recommendation_results_food_id_fkey"
  FOREIGN KEY ("food_id") REFERENCES "foods"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "recommendation_feedback"
  ADD CONSTRAINT "recommendation_feedback_actor_id_fkey"
  FOREIGN KEY ("actor_id") REFERENCES "actors"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "recommendation_feedback"
  ADD CONSTRAINT "recommendation_feedback_result_session_fkey"
  FOREIGN KEY ("recommendation_result_id", "session_id")
  REFERENCES "recommendation_results"("id", "session_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meal_logs"
  ADD CONSTRAINT "meal_logs_actor_id_fkey"
  FOREIGN KEY ("actor_id") REFERENCES "actors"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "meal_logs"
  ADD CONSTRAINT "meal_logs_recommendation_result_id_fkey"
  FOREIGN KEY ("recommendation_result_id") REFERENCES "recommendation_results"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "meal_logs"
  ADD CONSTRAINT "meal_logs_food_id_fkey"
  FOREIGN KEY ("food_id") REFERENCES "foods"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "uploaded_files"
  ADD CONSTRAINT "uploaded_files_actor_id_fkey"
  FOREIGN KEY ("actor_id") REFERENCES "actors"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "meal_log_photos"
  ADD CONSTRAINT "meal_log_photos_meal_log_id_fkey"
  FOREIGN KEY ("meal_log_id") REFERENCES "meal_logs"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meal_log_photos"
  ADD CONSTRAINT "meal_log_photos_uploaded_file_id_fkey"
  FOREIGN KEY ("uploaded_file_id") REFERENCES "uploaded_files"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
