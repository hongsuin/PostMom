-- 내 카드 데이터를 유저 간 비교 가능하게 공개 저장
-- 커뮤니티에서 "나와 비슷한 조건" 필터링에 사용
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id      uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  child_grade  text,
  english_level text,
  class_type   text,
  teaching_style text,
  budget_range text,
  distance     text,
  learning_type text,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능 (커뮤니티 매칭에 필요)
CREATE POLICY "public_read_profiles"
  ON user_profiles FOR SELECT
  USING (true);

-- 본인 프로필만 쓰기 가능
CREATE POLICY "own_write_profiles"
  ON user_profiles FOR ALL
  USING (auth.uid() = user_id);
