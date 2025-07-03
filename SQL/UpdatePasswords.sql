-- Script để cập nhật password hash trong database
UPDATE Accounts SET password_hash = '$2b$10$5yIXgrKWmsOXurLPFLm6Ku3d0XHZYhsUXvyvMbnD0WefI4WfPlkLO' WHERE username = 'admin01';
UPDATE Accounts SET password_hash = '$2b$10$VBQ33AMG1DIE6IyhEG8Rsua8g5zJHtHEtCquHukuhrDPIUwmPWc8C' WHERE username = 'doctor01';
UPDATE Accounts SET password_hash = '$2b$10$JLXsFxPDKpbDpfTWLnEawOYtRSrKy5reMFfSwzVp8..A54bqXxkSi' WHERE username = 'doctor02';
UPDATE Accounts SET password_hash = '$2b$10$LE6eaI8mKgALEMVvf73oRO6b8HkaT01x1zoKMKIPsCsXrchDXWwIG' WHERE username = 'doctor03';
UPDATE Accounts SET password_hash = '$2b$10$ddLibF8rB0BqfhjP0osnYuKaFqO0WYcenTtLWBa7yA6Sfq9OGT.Zi' WHERE username = 'labstaff01';
UPDATE Accounts SET password_hash = '$2b$10$JOzqTAnXzpqMc4UH.kPrY.aD5d2SJNTn.lYIEiPCTfiGbqomAbnp.' WHERE username = 'labstaff02';
UPDATE Accounts SET password_hash = '$2b$10$0Le2SIyw4iavY5dy2yhkMOD7bEy6dFrq4vsqTYKTiTwTi/d.IdzEG' WHERE username = 'regstaff01';
UPDATE Accounts SET password_hash = '$2b$10$Ybza.Z0Bd/CBTHsXuEm3.ewckPUPfrb2nX5Cuj5FirLRcYoVPbo16' WHERE username = 'regstaff02';
UPDATE Accounts SET password_hash = '$2b$10$R4GU6QXXC4Yd9A75aPQyP.11OZFQXpBDY9KOGe5QmT79.DPViX6oS' WHERE username = 'patient01';
UPDATE Accounts SET password_hash = '$2b$10$g//P460qO3BUjjb7AElXL.9SSneTkoGzSwUtgr/ZAPVxQIdWUyyM6' WHERE username = 'patient02';
UPDATE Accounts SET password_hash = '$2b$10$x.pTUnbdim70JyRNDTmREOYag7O0mwI9OMoHUKZ9Mi6K9Q1wuXFrW' WHERE username = 'patient03';
UPDATE Accounts SET password_hash = '$2b$10$DMyV/q3.A3sILMGuo1XF3.SWDA2SyjQ9SyS6mXOWWWPqfebyJ7JQ6' WHERE username = 'patient04';
UPDATE Accounts SET password_hash = '$2b$10$M3pd.j2T2c2nawZEs0m9IeAru3iNRglqaGqGEnzuTL/cykzcnKG/y' WHERE username = 'patient05';
