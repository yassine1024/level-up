ALTER TABLE generated_exercise_sets
    ADD COLUMN IF NOT EXISTS generation_run_id BIGINT;

ALTER TABLE generated_slide_decks
    ADD COLUMN IF NOT EXISTS generation_run_id BIGINT;