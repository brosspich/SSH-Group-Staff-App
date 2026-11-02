-- ========================================================
-- Populate Normalized Tables (User, SshGroup, GroupMember)
-- ========================================================

-- 1. Insert Users from Staff Data
INSERT OR REPLACE INTO User (id, username, email, passwordHash, name, role, isActive, createdAt, updatedAt) VALUES
('0000', 'test', NULL, '$2a$10$Djwt1bv8a0vnyRGfyICnV.9BYR25R91rAoI4PZ/VKNQfLVFhA8mQC', 'Staff Test', 'member', 1, datetime('now'), datetime('now')),
('0001', 'pichboyloy', 'langpich2905@gmail.com', '$2b$10$PFS3Ivt1R8yYMupB8FSQD.JzQ0matp.gsoedygoTmuPyuPXOoE31e', 'Pich Boy Loyyyyy', 'owner', 1, datetime('now'), datetime('now')),
('0002', 'test1', NULL, '$2b$10$UZ6O8G/KuxYDluh.QwRFe.n/HVGCy3OFbyiHlcwSaCGiof9lnGsJ.', 'Test User', 'member', 1, datetime('now'), datetime('now')),
('0006', 'sokleap', NULL, '$2a$10$cJI176elb/IruLAGjRPrcuYVp43j0EKoyoOcFD/4DEvHWL6z33C5S', 'Ms. SI Sokleap', 'member', 1, datetime('now'), datetime('now')),
('0007', 'sokkoeu', NULL, '$2a$10$gTiYEq7D9P/S0mDn9t71C.9t3K2lhxyMWqONSA.DHLPv5.78i5WGS', 'Mr. BUN Sokkoeu', 'member', 1, datetime('now'), datetime('now')),
('0015', 'pheng', NULL, '$2a$10$92XoQWmwfJr/ouvCK9cGq.CD/IrxMwACplR.6fI19HP3Gdq/hbugO', 'Mr. Sot Haopheng', 'member', 1, datetime('now'), datetime('now')),
('0016', 'sreypov', NULL, '$2a$10$KqRRGUh24jrQM5VWumTPCegOq.BBUVnfUL0RW1qLxLP7NWNs8UNJq', 'Ms. NEP Sreypov', 'member', 1, datetime('now'), datetime('now')),
('0017', 'kompheak', NULL, '$2a$10$KGMMjz/XaKjXU1so3joFr.EqmDLF.SFcnFKrlY/W1hup.wwkn7cM6', 'Ms. YOU Kompheak', 'member', 1, datetime('now'), datetime('now')),
('0019', 'sreynit', NULL, '$2a$10$AEaEfJz4tXybT9JPVL8K3uW3BQ1sKr6TwlJM1Zwb5TvL6YGciDFba', 'Ms. PHOS Sreynit', 'member', 1, datetime('now'), datetime('now')),
('0020', 'panha', NULL, '$2a$10$U5.Pf3KZbdkDh9iqfEPPROFQ/15gQ9zKzQ7f9UYD2hjzW0L0oZ/Qu', 'Mr. HON Panha', 'member', 1, datetime('now'), datetime('now')),
('0021', 'sambath', NULL, '$2a$10$ka1T8HLl8OrpcQ25wpVf/ufTF1b1oUEKpv/D7euHNrCqg6Q94Ixma', 'Mr. EANG Sambath', 'member', 1, datetime('now'), datetime('now')),
('0022', 'brosspich', 'it.langpich@gmail.com', '$2a$10$c2DqxtxCsLwf2gJbgxDCN.MeX2ch99IgpPHW11MpDJ0UHUJOLgSBK', 'Mr. LANG Pich', 'admin', 1, datetime('now'), datetime('now')),
('0023', 'seyha', NULL, '$2a$10$nOiXmi7cj3sZLMCZfC7RIOBcVXhmxVSP/xQfI7LVCs3trILTOehHC', 'Mr. ENG Seyha', 'member', 1, datetime('now'), datetime('now')),
('0024', 'menghor', NULL, '$2a$10$BiuI90JjpIwx/2MYXQZCrORLPxPk0JBODUkUCbxd.A5G0Vg6bqVN.', 'Mr. HORN Menghor', 'member', 1, datetime('now'), datetime('now')),
('0025', 'rothanak', NULL, '$2a$10$2taLBeFQ/LS0BdFyNQ6yoOVtvoiCMuD8zPL8We7dxYPjCp1aTESxK', 'Mr. DOK Rothanak', 'member', 1, datetime('now'), datetime('now')),
('0026', 'cheara', NULL, '$2a$10$SDLxSqQ2XhhvCDCIqc8YfuA91pXB43OOD/dpOLOzRv2GrjoJL598S', 'Ms. SUN Cheara', 'member', 1, datetime('now'), datetime('now')),
('bpak-0001', 'bpak', 'bpak@sshgroup.com', '$2a$10$cgtVaUrc./oi1kmPmpPD0eC9QYTBnVxqDiy2bOk48D5Fr7g4s.3H.', 'BPAK BROSSPICH', 'admin', 1, datetime('now'), datetime('now'));

-- 2. Create Initial SSH Server Groups
INSERT OR REPLACE INTO SshGroup (id, name, description, serverCount, createdAt, updatedAt) VALUES
('grp-prod', 'Production Servers', 'Main production cluster and public APIs', 5, datetime('now'), datetime('now')),
('grp-staging', 'Staging Environment', 'Pre-release testing and QA servers', 2, datetime('now'), datetime('now')),
('grp-dev', 'Development Cluster', 'Internal developer sandboxes and staging VMs', 3, datetime('now'), datetime('now')),
('grp-database', 'Database Infrastructure', 'Cloudflare D1, SQLite & Cache instances', 2, datetime('now'), datetime('now'));

-- 3. Assign Memberships to SSH Groups
-- Admins (brosspich & bpak) have full Admin access to all groups
INSERT OR REPLACE INTO GroupMember (id, userId, groupId, permission, joinedAt) VALUES
('mem-01', '0022', 'grp-prod', 'admin', datetime('now')),
('mem-02', '0022', 'grp-staging', 'admin', datetime('now')),
('mem-03', '0022', 'grp-dev', 'admin', datetime('now')),
('mem-04', '0022', 'grp-database', 'admin', datetime('now')),
('mem-05', 'bpak-0001', 'grp-prod', 'admin', datetime('now')),
('mem-06', 'bpak-0001', 'grp-staging', 'admin', datetime('now')),
('mem-07', 'bpak-0001', 'grp-dev', 'admin', datetime('now')),
('mem-08', 'bpak-0001', 'grp-database', 'admin', datetime('now')),
('mem-09', '0001', 'grp-dev', 'write', datetime('now')),
('mem-10', '0015', 'grp-staging', 'read', datetime('now')),
('mem-11', '0000', 'grp-dev', 'read', datetime('now'));

-- 4. Initial Security Audit Log
INSERT OR REPLACE INTO AuditLog (id, action, actorId, actorName, targetId, details, ipAddress, timestamp) VALUES
('audit-init-01', 'SYSTEM_INITIALIZED', '0022', 'brosspich', 'system', '{"message":"Users and SSH Groups successfully provisioned"}', '127.0.0.1', datetime('now'));
