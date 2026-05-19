-- 初始議題（只在 DB 第一次建立時執行）
INSERT INTO scenarios (title, is_active)
VALUES ('討論議題一：生成式AI與文字創作', true)
ON CONFLICT DO NOTHING;
