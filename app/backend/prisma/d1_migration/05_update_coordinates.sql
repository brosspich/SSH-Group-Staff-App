-- ========================================================
-- Cloudflare D1: Update Company Coordinates to Direct GPS
-- ========================================================

-- 1. Update Company table with direct coordinates
UPDATE Company 
SET location = '["11.502767, 104.851539"]' 
WHERE id = 'system-0001';

UPDATE Company 
SET location = '["11.536203, 104.858147"]' 
WHERE id = 'system-0002';

UPDATE Company 
SET location = '["11.556372, 104.928210"]' 
WHERE id = 'system-0003';

-- 2. Update legacy table ssh-group-staff-attendance-qr for backward compatibility
UPDATE "ssh-group-staff-attendance-qr" 
SET location = '["11.502767, 104.851539"]' 
WHERE id = 'system-0001';

UPDATE "ssh-group-staff-attendance-qr" 
SET location = '["11.536203, 104.858147"]' 
WHERE id = 'system-0002';

UPDATE "ssh-group-staff-attendance-qr" 
SET location = '["11.556372, 104.928210"]' 
WHERE id = 'system-0003';
