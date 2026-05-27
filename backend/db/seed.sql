-- 初始議題（只在 DB 第一次建立時執行）
INSERT INTO scenarios (title, is_active, opening_message)
VALUES ('討論議題一：生成式AI與文字創作', true, '你可以先說說看，你比較贊成還是不贊成讓生成式AI取代原本的文字生產工作？')
ON CONFLICT DO NOTHING;

INSERT INTO scenarios (title, is_active, opening_message)
VALUES ('討論議題二：生成式AI與影像創作', true, '你可以先說說看，你比較贊成還是不贊成讓生成式AI取代原本的影像創作工作？')
ON CONFLICT DO NOTHING;
