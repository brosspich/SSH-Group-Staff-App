-- ========================================================
-- Cloudflare D1: Insert User 0022 (Mr. LANG Pich)
-- ========================================================

INSERT OR REPLACE INTO User (
  id, 
  username, 
  email, 
  passwordHash, 
  name, 
  phone, 
  position, 
  role, 
  isActive, 
  company_id, 
  createdAt, 
  updatedAt
) VALUES (
  '0022', 
  'brosspich', 
  'it.langpich@gmail.com', 
  '$2a$10$c2DqxtxCsLwf2gJbgxDCN.MeX2ch99IgpPHW11MpDJ0UHUJOLgSBK', 
  'Mr. LANG Pich', 
  '0967912747', 
  'IT Support', 
  'admin', 
  1, 
  'system-0001', 
  datetime('now'), 
  datetime('now')
);
