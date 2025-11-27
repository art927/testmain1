-- 005_evaluation_system.sql
-- Baseline schema for performance evaluation system
-- Safe to run on an existing DB: only uses CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS

------------------------------------------------------------
-- evaluation_modules
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evaluation_modules (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  description         text,
  applies_to_department text,
  applies_to_team_id  uuid,
  scoring_scale_min   integer NOT NULL DEFAULT 1,
  scoring_scale_max   integer NOT NULL DEFAULT 10,
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  weight              integer,
  frequency           text,
  seniority           text
);

-- Optional FK (no IF NOT EXISTS available for constraints; harmless if it already exists or fails once when table created)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'evaluation_modules_applies_to_team_id_fkey'
  ) THEN
    ALTER TABLE public.evaluation_modules
      ADD CONSTRAINT evaluation_modules_applies_to_team_id_fkey
      FOREIGN KEY (applies_to_team_id) REFERENCES public.teams(id) ON DELETE SET NULL;
  END IF;
END$$;

------------------------------------------------------------
-- evaluation_periods
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evaluation_periods (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id   uuid NOT NULL,
  name        text NOT NULL,
  frequency   text NOT NULL,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  is_open     boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'evaluation_periods_module_id_fkey'
  ) THEN
    ALTER TABLE public.evaluation_periods
      ADD CONSTRAINT evaluation_periods_module_id_fkey
      FOREIGN KEY (module_id) REFERENCES public.evaluation_modules(id) ON DELETE CASCADE;
  END IF;
END$$;

------------------------------------------------------------
-- evaluation_sections
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evaluation_sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id   uuid,
  name        text NOT NULL,
  weight      integer NOT NULL,
  order_index integer NOT NULL,
  created_at  timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'evaluation_sections_module_id_fkey'
  ) THEN
    ALTER TABLE public.evaluation_sections
      ADD CONSTRAINT evaluation_sections_module_id_fkey
      FOREIGN KEY (module_id) REFERENCES public.evaluation_modules(id) ON DELETE CASCADE;
  END IF;
END$$;

------------------------------------------------------------
-- evaluation_questions
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evaluation_questions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id      uuid NOT NULL,
  question_text  text NOT NULL,
  question_type  text NOT NULL,
  question_order integer NOT NULL DEFAULT 1,
  is_required    boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  section_id     uuid
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'evaluation_questions_module_id_fkey'
  ) THEN
    ALTER TABLE public.evaluation_questions
      ADD CONSTRAINT evaluation_questions_module_id_fkey
      FOREIGN KEY (module_id) REFERENCES public.evaluation_modules(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'evaluation_questions_section_id_fkey'
  ) THEN
    ALTER TABLE public.evaluation_questions
      ADD CONSTRAINT evaluation_questions_section_id_fkey
      FOREIGN KEY (section_id) REFERENCES public.evaluation_sections(id) ON DELETE SET NULL;
  END IF;
END$$;

------------------------------------------------------------
-- evaluation_instances
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evaluation_instances (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL,
  period_id            uuid NOT NULL,
  module_id            uuid NOT NULL,
  self_status          text NOT NULL DEFAULT 'not-started',
  self_submitted_at    timestamptz,
  manager_status       text NOT NULL DEFAULT 'not-started',
  manager_submitted_at timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'evaluation_instances_user_id_fkey'
  ) THEN
    ALTER TABLE public.evaluation_instances
      ADD CONSTRAINT evaluation_instances_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'evaluation_instances_period_id_fkey'
  ) THEN
    ALTER TABLE public.evaluation_instances
      ADD CONSTRAINT evaluation_instances_period_id_fkey
      FOREIGN KEY (period_id) REFERENCES public.evaluation_periods(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'evaluation_instances_module_id_fkey'
  ) THEN
    ALTER TABLE public.evaluation_instances
      ADD CONSTRAINT evaluation_instances_module_id_fkey
      FOREIGN KEY (module_id) REFERENCES public.evaluation_modules(id) ON DELETE CASCADE;
  END IF;
END$$;

------------------------------------------------------------
-- evaluation_answers
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evaluation_answers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id     uuid NOT NULL,
  question_id     uuid,
  question_text   text NOT NULL,
  self_score      integer,
  self_comment    text,
  manager_score   integer,
  manager_comment text,
  last_updated_by uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'evaluation_answers_instance_id_fkey'
  ) THEN
    ALTER TABLE public.evaluation_answers
      ADD CONSTRAINT evaluation_answers_instance_id_fkey
      FOREIGN KEY (instance_id) REFERENCES public.evaluation_instances(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'evaluation_answers_question_id_fkey'
  ) THEN
    ALTER TABLE public.evaluation_answers
      ADD CONSTRAINT evaluation_answers_question_id_fkey
      FOREIGN KEY (question_id) REFERENCES public.evaluation_questions(id) ON DELETE SET NULL;
  END IF;
END$$;

------------------------------------------------------------
-- Helpful indexes
------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_eval_periods_module_id
  ON public.evaluation_periods(module_id);

CREATE INDEX IF NOT EXISTS idx_eval_sections_module_id
  ON public.evaluation_sections(module_id);

CREATE INDEX IF NOT EXISTS idx_eval_questions_module_id
  ON public.evaluation_questions(module_id);

CREATE INDEX IF NOT EXISTS idx_eval_instances_user_period
  ON public.evaluation_instances(user_id, period_id);

CREATE INDEX IF NOT EXISTS idx_eval_instances_module_id
  ON public.evaluation_instances(module_id);

CREATE INDEX IF NOT EXISTS idx_eval_answers_instance_id
  ON public.evaluation_answers(instance_id);

-- (Optional) If you later enable RLS on these tables, add policies in a separate script.
