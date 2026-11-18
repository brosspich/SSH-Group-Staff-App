export interface PolicySection {
  title: string;
  body: string;
}

export type PolicyLang = "en" | "zh" | "km" | "fr";

export const BACKEND_APP_VERSION = "1.0.1.10311";

export const PRIVACY_POLICY_LAST_UPDATED: Record<PolicyLang, string> = {
  en: `Last Updated App Version: ${BACKEND_APP_VERSION}`,
  zh: `最后更新应用版本：${BACKEND_APP_VERSION}`,
  km: `ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ កំណែកម្មវិធី៖ ${BACKEND_APP_VERSION}`,
  fr: `Dernière mise à jour Version de l'application : ${BACKEND_APP_VERSION}`,
};

export const PRIVACY_POLICY_DATA: Record<PolicyLang, PolicySection[]> = {
  en: [
    {
      title: "1. Developer & Introduction",
      body: "The SSH Group Staff App (package: com.sshgroups.staffapp) is developed and operated by SSH Group Co., Ltd. (Phnom Penh, Cambodia). This enterprise application is engineered specifically for internal workforce management, 0ms ultra-fast QR attendance check-in/check-out, Haversine GPS geofence verification, shift logs, leave/missing scan requests, hardware device session binding, and attendance reporting. This Privacy Policy outlines our transparent commitment to safeguarding staff data, detailing how operational information is collected, processed, synchronized, and protected.",
    },
    {
      title: "2. Information We Collect",
      body: "To deliver reliable workforce management and attendance integrity, the application collects and processes the following information:\n\n• Account & Profile Information: Staff ID, System ID (branch-scoped identifier e.g. system-0001, system-0002), employee full name, globally unique username, encrypted password credentials, assigned organizational role (Owner, Admin, Staff, Leave), position, date of birth (DOB), email, phone number, and profile avatar.\n• Camera & Optical QR Scanning: Camera access is requested solely for instant optical QR code scanning during attendance check-in/check-out and for capturing optional proof photos during attendance requests. The camera is never accessed in the background or without explicit user action.\n• Location & Geofence Verification: Precise GPS coordinates are accessed exclusively at the exact moment a staff member performs a check-in or check-out. Device coordinates are validated using the Haversine formula against registered branch workplace geofences (latitude, longitude, and radius meters). The system inspects for mock location providers (isMocked) and virtual private network (VPN) interfaces to prevent attendance spoofing. Background location is NEVER tracked or recorded.\n• Attendance Logs & Sequential Requests: Timestamps of check-in and check-out logs, total daily work hours, attendance status, and sequential request records formatted per staff user (e.g. {system_id}-ATT-0000-0001 and {system_id}-REQ-0000-0001), including leave reasons, remarks, and approval decisions.\n• Hardware Binding & Device Sessions: Device manufacturer, hardware model, operating system, IP address, and unique session UUIDs (DeviceSession) to prevent credential sharing and enforce single-device active session security.\n• Secure On-Device Storage: Sandboxed on-device database cache and secure persistent storage (AsyncStorage, Expo SecureStore) for offline readiness and instant UI rendering.",
    },
    {
      title: "3. How We Use Your Information",
      body: "We process employee data strictly for legitimate operational and enterprise workforce management purposes:\n\n• Authentication & Branch Isolation: Authenticating credentials, issuing secure JWT tokens, enforcing branch-scoped system IDs, and preventing unauthorized cross-company access.\n• 0ms Fast Attendance Verification: Validating QR codes in 0ms locally, confirming physical workplace geofence radius, and verifying device authenticity.\n• Request Lifecycle Management: Receiving, reviewing, and approving staff leave, overtime, and missing scan requests with photo attachments.\n• Hardware Device Binding: Enforcing single-device active sessions, displaying active hardware devices, and allowing staff or admins to terminate unauthorized remote sessions.\n• Administrative Telegram Alerts: Dispatching real-time notifications with staff IDs, attendance timestamps, and proof photos to authorized company Telegram channels via Telegram Bot API.\n• Enterprise Reports & Printing: Compiling Daily, Weekly, Monthly, and Annual attendance summaries with full search, filtering, and PDF generation.\n• Dynamic System Configuration: Providing up-to-date support links and official communication channels without requiring mobile app rebuilds.\n\nWe strictly do not sell, rent, monetize, or transfer your personal data to commercial third parties, ad networks, or data brokers.",
    },
    {
      title: "4. Data Storage, Security & Cloud Architecture",
      body: "• Distributed Cloud Database Infrastructure: High-availability distributed cloud SQL database for real-time staff records, attendance logs, requests, and branch configurations.\n• Encrypted Cloud Object Storage: High-throughput secure cloud object storage for attendance proof photos and avatars.\n• Sandboxed Local Storage & Offline Continuity: Sandboxed on-device storage providing zero-latency operation and full offline continuity with automated cloud synchronization.\n• Strong Password Hashing: All user passwords are salted and hashed using industry-standard bcrypt before database storage; raw passwords are never saved in plain text.\n• Transport Layer Security (TLS 1.3): All network communications between the mobile app and backend APIs are encrypted using modern HTTPS / TLS 1.3.\n• Hardware Device Session Security: Device sessions are tied to unique hardware signatures and can be remotely revoked at any time.",
    },
    {
      title: "5. Multi-Branch & System ID Isolation",
      body: "The application architecture enforces strict branch segregation (e.g. system-0001, system-0002). Staff profiles, attendance calendars, request approvals, and hardware sessions are compartmentalized by company System ID to guarantee complete privacy and zero data overlap between independent organizational units.",
    },
    {
      title: "6. Branch Subscription & Non-Subscription Guard",
      body: "To protect organization data, the backend enforces automated branch subscription validity checking. In the event that a branch subscription expires, staff accounts under that branch are safely transitioned to the Non-Subscription screen with official support channels, preventing unauthorized access until renewed.",
    },
    {
      title: "7. Third-Party Enterprise Integrations",
      body: "The application integrates only essential, enterprise-grade cloud services:\n\n• Enterprise Cloud Infrastructure: Secure cloud database hosting, high-availability edge networking, and encrypted media storage.\n• Telegram Bot API: Secure internal transmission of real-time attendance alerts to management channels.\n• Expo Framework: Native device integration libraries for optical camera scanning, GPS location, and secure hardware storage.\n\nThere are NO third-party advertising SDKs, tracking pixels, or behavioral analytics libraries integrated into this application.",
    },
    {
      title: "8. User Rights & Account Management",
      body: "Employees and administrators maintain full oversight over their operational data:\n\n• Profile Review & Updates: Staff can view their personal information, update contact details, and change credentials directly in the app.\n• Session Management: Staff can view all active login devices and terminate unfamiliar sessions remotely.\n• Account Decommissioning: Upon conclusion of employment, organization administrators may deactivate accounts, revoke active sessions, and remove device bindings. For inquiries, contact your system administrator or support@sshgroups.com.",
    },
    {
      title: "9. Data Retention & Audit Standards",
      body: "Attendance logs, request records, and hardware audit logs are retained in accordance with company governance, labor regulations, and audit requirements. Decommissioned account credentials and active sessions are promptly deleted or anonymized.",
    },
    {
      title: "10. Contact Us & Support",
      body: "SSH Group Co., Ltd.\nLocation: Phnom Penh, Cambodia\nEmail: support@sshgroups.com\nTelegram Support: https://t.me/sshgroup168\nWebsite: www.sshgroups.com\n\nFor questions, technical support, or privacy inquiries, please reach out to our team directly through the official support channels.",
    },
  ],
  zh: [
    {
      title: "1. 开发者与引言",
      body: "SSH Group Staff 移动应用程序（包名：com.sshgroups.staffapp）由位于柬埔寨金边的 SSH Group Co., Ltd. 开发并运营。本企业级应用专为内部员工考勤管理、0毫秒极速动态二维码打卡、Haversine 地理围栏定位验证、考勤补签与请假审批、硬件设备会话绑定及多维度考勤报表设计。本隐私政策详细阐明我们如何收集、处理、同步、存储和保护您的工作及个人信息。",
    },
    {
      title: "2. 我们收集的信息",
      body: "为提供稳定高效的企业考勤管理服务并保障考勤数据真实性，本应用收集并处理以下数据：\n\n• 账户与个人信息：员工工号（Staff ID）、系统分支编号（System ID，如 system-0001、system-0002）、全名、分部专属用户名、加盐哈希加密密码、角色权限（Owner、Admin、Staff、Leave）、职位、出生日期（DOB）、电子邮件、联系电话及个人头像。\n• 摄像头与二维码扫描：应用请求摄像头权限仅用于员工上下班考勤时的 0ms 动态二维码扫描以及提交申请时的证明照片拍摄。摄像头绝不会在后台静默启动或在未经用户操作的情况下拍摄。\n• 地理位置与地理围栏验证：仅在员工点击签到或签退的瞬间获取精确 GPS 坐标。系统使用 Haversine 球面距离公式实时计算员工与分部设定地理坐标（经纬度及允许半径）的距离，并检测模拟位置（isMocked）及 VPN 网络虚拟网卡，以防止考勤作弊。应用绝不会在后台持续追踪或记录您的日常行踪。\n• 考勤日志与序列化申请记录：签到与签退时间戳、每日工作时长、按员工编号严格序列化的记录编号（例如 {system_id}-ATT-0000-0001 与 {system_id}-REQ-0000-0001）、请假事由、备注说明及审批状态。\n• 硬件绑定与设备会话（DeviceSession）：设备型号、硬件制造商、操作系统版本、IP 地址及唯一会话 UUID，用于防止账号多人共享并执行单设备在线安全策略。\n• 设备本地安全存储：本地沙盒安全存储组件（AsyncStorage、Expo SecureStore）及离线缓存，用于实现离线应急使用及零延迟界面渲染。",
    },
    {
      title: "3. 我们如何使用您的信息",
      body: "我们处理收集的员工数据严格用于正当的企业管理目的：\n\n• 身份认证与分部数据隔离：验证登录凭据、签发安全 JWT 令牌、执行分部独立 System ID 隔离，杜绝跨公司越权访问。\n• 0毫秒考勤打卡校验：本地毫秒级校验二维码真实性、核验办公区域地理围栏并验证设备合规性。\n• 审批流程管理：接收、审核并批复员工的请假、补签及加班申请（含佐证照片）。\n• 硬件设备会话管理：限制单账号单设备登录，展示当前在线设备列表，允许员工或管理员远程注销异常设备。\n• 管理端 Telegram 实时通知：通过安全的 Telegram Bot API 向管理频道实时推送考勤打卡详情、照片凭证及申请通知。\n• 考勤报表生成与打印：汇总生成日报、周报、月报及年报，支持即时搜索、筛选及 PDF 导出打印。\n• 动态系统配置：从云端动态获取最新客服支持渠道及社交链接，无需频繁更新应用版本。\n\n我们郑重承诺，绝不向任何第三方广告商、营销机构或数据经纪人出售、出租或披露员工数据。",
    },
    {
      title: "4. 数据存储、安全与云端架构",
      body: "• 分布式企业级云数据库：高可用分布式云端数据库，用于安全存储全球实时的员工数据、考勤日志及审批记录。\n• 加密云端对象存储：高标准端到端加密云端存储，安全保存考勤打卡照片与员工头像。\n• 本地沙盒安全存储与离线容灾：基于受保护的沙盒本地存储，提供零延迟离线运行能力与自动双向加密云端同步。\n• 强密码加盐哈希保护：所有用户密码在入库前均经过行业标准 bcrypt 加盐哈希加密，服务器端绝不保存或明文传输密码。\n• 传输安全（TLS 1.3）：移动端与后端接口之间的所有网络通信均通过 HTTPS / TLS 1.3 现代加密协议传输。\n• 设备会话硬件密钥控制：设备会话与硬件特征绑定，支持随时远程吊销。",
    },
    {
      title: "5. 多分部与 System ID 数据隔离",
      body: "应用程序架构支持严格的分公司与多分部物理隔离（如 system-0001、system-0002 等）。员工档案、考勤日历、审批队列及设备会话均基于公司 System ID 独立划分，确保不同分部之间的数据绝对保密与独立运行。",
    },
    {
      title: "6. 分部订阅与停机保护机制",
      body: "为保护企业资产，后端自动计算分部订阅服务有效期限。若分部服务到期，系统将自动平滑拦截该分部员工进入 Non-Subscription 界面，提示官方客服续订支持，避免未经授权的业务操作。",
    },
    {
      title: "7. 第三方企业级服务集成",
      body: "本应用仅集成必要的企业级基础设施服务：\n\n• 企业级云端基础设施：边缘网络加速、高可用数据库服务与媒体文件加密存储。\n• Telegram Bot API：安全发送考勤与申请内部行政提醒。\n• Expo 框架：提供摄像头扫码、GPS 定位及硬件本地安全存储等底层能力。\n\n应用内不含任何广告 SDK、用户画像追踪代码或商业化追踪器。",
    },
    {
      title: "8. 用户权利与账户管理",
      body: "员工及管理员对其工作数据拥有充分的管理权：\n\n• 查阅与修改：可在应用内查阅个人档案，修改允许的联络方式及密码。\n• 设备管理：可随时查看当前在线的设备列表，并远程终止非本人或废弃的登录会话。\n• 账户停用：离职或劳动关系终止时，管理员可注销账户、吊销所有登录会话并解绑设备。如有疑问可联系系统管理员或发送邮件至 support@sshgroups.com。",
    },
    {
      title: "9. 数据保留与审计标准",
      body: "考勤日志、申请记录与设备审计日志将依据公司人事管理制度及相关劳动法律法规安全归档保留。注销后的账户凭证将及时清理或脱敏匿名化处理。",
    },
    {
      title: "10. 联系方式与技术支持",
      body: "SSH Group Co., Ltd.\n地址：柬埔寨金边\n电子邮箱：support@sshgroups.com\nTelegram 支持：https://t.me/sshgroup168\n官方网站：www.sshgroups.com\n\n如对本隐私政策或考勤数据处理有任何疑问，请随时通过官方技术支持渠道与我们联系。",
    },
  ],
  km: [
    {
      title: "1. អ្នកអភិវឌ្ឍន៍ និងការណែនាំ",
      body: "កម្មវិធីទូរស័ព្ទ SSH Group Staff App (កញ្ចប់កម្មវិធី៖ com.sshgroups.staffapp) ត្រូវបានអភិវឌ្ឍ និងគ្រប់គ្រងដោយក្រុមហ៊ុន SSH Group Co., Ltd. (រាជធានីភ្នំពេញ ព្រះរាជាណាចក្រកម្ពុជា)។ កម្មវិធីកម្រិតសហគ្រាសនេះ ត្រូវបានរចនាឡើងយ៉ាងពិសេសសម្រាប់ការគ្រប់គ្រងបុគ្គលិកផ្ទៃក្នុង ការកត់ត្រាវត្តមានល្បឿនលឿន 0ms តាមរយៈការស្កែន QR Code ការផ្ទៀងផ្ទាត់ទីតាំងភូមិសាស្ត្រ Haversine GPS Geofence ការពិនិត្យម៉ោងបំពេញការងារ ការស្នើសុំច្បាប់ ឬបំពេញម៉ោងស្កែនដែលខកខាន ការចងភ្ជាប់សម័យប្រជុំឧបករណ៍ទូរស័ព្ទ (Device Session Binding) និងការទាញយករបាយការណ៍វត្តមាន។ គោលការណ៍ឯកជនភាពនេះ បញ្ជាក់យ៉ាងច្បាស់អំពីការប្តេជ្ញាចិត្តប្រកបដោយតម្លាភាពក្នុងការការពារទិន្នន័យបុគ្គលិក និងរបៀបដែលព័ត៌មានត្រូវបានប្រមូល ដំណើរការ ធ្វើសមកាលកម្ម រក្សាទុក និងការពារ។",
    },
    {
      title: "2. ព័ត៌មានដែលយើងប្រមូល",
      body: "ដើម្បីធានាដំណើរការការងារគ្រប់គ្រងវត្តមានប្រកបដោយប្រសិទ្ធភាព និងភាពត្រឹមត្រូវ កម្មវិធីប្រមូល និងដំណើរការព័ត៌មានដូចខាងក្រោម៖\n\n• ព័ត៌មានគណនី និងប្រវត្តិរូប៖ អត្តលេខបុគ្គលិក (Staff ID), លេខសម្គាល់ប្រព័ន្ធសាខា (System ID ដូចជា system-0001, system-0002), ឈ្មោះពេញ, ឈ្មោះគណនីតាមសាខា (Username), ពាក្យសម្ងាត់ដែលបានបំប្លែងកូដសុវត្ថិភាព (bcrypt hash), តួនាទីការងារ (Owner, Admin, Staff, Leave), មុខតំណែង, ថ្ងៃខែឆ្នាំកំណើត (DOB), អាសយដ្ឋានអ៊ីមែល, លេខទូរស័ព្ទ និងរូបថតប្រវត្តិរូប។\n• ការប្រើប្រាស់កាមេរ៉ា និងការស្កែន QR Code៖ ការអនុញ្ញាតកាមេរ៉ាត្រូវបានប្រើប្រាស់សម្រាប់តែការស្កែន QR Code ភ្លាមៗ (0ms) ពេលចុះវត្តមានចូល/ចេញ និងសម្រាប់ថតរូបភាពភស្តុតាងនៅពេលបុគ្គលិកធ្វើសំណើសុំច្បាប់ប៉ុណ្ណោះ។ កម្មវិធីមិនដែលដំណើរការកាមេរ៉ានៅផ្ទៃខាងក្រោយ ឬថតរូបដោយគ្មានការបញ្ជាផ្ទាល់ឡើយ។\n• ព័ត៌មានទីតាំង និងការផ្ទៀងផ្ទាត់បរិវេណក្រុមហ៊ុន (Geofence)៖ កម្មវិធីស្នើសុំកូអរដោនេ GPS ជាក់លាក់តែនៅពេលបុគ្គលិកចុចកត់ត្រាវត្តមានប៉ុណ្ណោះ។ កូអរដោនេត្រូវបានផ្ទៀងផ្ទាត់ដោយប្រើរូបមន្ត Haversine ធៀបនឹងទីតាំងសាខាក្រុមហ៊ុនដែលបានកំណត់ (រយៈទទឹង រយៈបណ្តោយ និងកាំចម្ងាយម៉ែត្រ)។ ប្រព័ន្ធក៏ធ្វើការត្រួតពិនិត្យកម្មវិធីក្លែងបន្លំទីតាំង (isMocked) និងប្រព័ន្ធបណ្តាញនិម្មិត (VPN) ដើម្បីការពារការបន្លំវត្តមាន។ កម្មវិធីមិនតាមដានទីតាំងរបស់អ្នកនៅផ្ទៃខាងក្រោយជាដាច់ខាត។\n• កំណត់ត្រាវត្តមាន និងសំណើតាមលំដាប់លំដោយ (Sequential Requests)៖ ពេលវេលាចុះវត្តមានចូល/ចេញ, ម៉ោងការងារសរុប, ស្ថានភាពវត្តមាន, និងលេខកូដសំណើតាមលំដាប់បុគ្គលិកនីមួយៗ (ឧ. {system_id}-ATT-0000-0001 និង {system_id}-REQ-0000-0001) រួមទាំងមូលហេតុសុំច្បាប់ កំណត់សម្គាល់ និងលទ្ធផលអនុម័ត។\n• ការចងភ្ជាប់ឧបករណ៍ និងសម័យប្រជុំ (DeviceSession)៖ ម៉ាកទូរស័ព្ទ, ម៉ូឌែល, កំណែប្រព័ន្ធប្រតិបត្តិការ, អាសយដ្ឋាន IP, និងលេខសម្គាល់សម័យប្រជុំ (UUID) ដើម្បីការពារការចែករំលែកគណនីគ្នា និងអនុវត្តគោលការណ៍ឧបករណ៍តែមួយសម្រាប់គណនីនីមួយៗ។\n• ការរក្សាទុកក្នុងឧបករណ៍ប្រកបដោយសុវត្ថិភាព៖ អង្គផ្ទុកទិន្នន័យសុវត្ថិភាពក្នុងទូរស័ព្ទ (Sandboxed Local Storage) និងសតិបណ្ដោះអាសន្នសុវត្ថិភាព (AsyncStorage, Expo SecureStore) សម្រាប់ដំណើរការក្រៅបណ្តាញ (Offline) និងការបង្ហាញទិន្នន័យភ្លាមៗ។",
    },
    {
      title: "3. របៀបដែលយើងប្រើប្រាស់ព័ត៌មានរបស់អ្នក",
      body: "យើងដំណើរការព័ត៌មានបុគ្គលិកសម្រាប់តែគោលបំណងអាជីវកម្ម និងការគ្រប់គ្រងធនធានមនុស្សស្របច្បាប់ប៉ុណ្ណោះ៖\n\n• ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ និងការបែងចែកសាខា៖ ផ្ទៀងផ្ទាត់ការចូលប្រើប្រាស់ ចេញថូខិន JWT កំណត់សិទ្ធិប្រើប្រាស់តាម System ID និងទប់ស្កាត់ការជ្រៀតចូលឆ្លងក្រុមហ៊ុន។\n• ការផ្ទៀងផ្ទាត់វត្តមានល្បឿនលឿន 0ms៖ ផ្ទៀងផ្ទាត់ QR Code ក្នុងល្បឿន 0ms ពិនិត្យទីតាំងភូមិសាស្ត្របរិវេណក្រុមហ៊ុន និងផ្ទៀងផ្ទាត់ភាពត្រឹមត្រូវនៃទូរស័ព្ទ។\n• ការគ្រប់គ្រងសំណើច្បាប់៖ ទទួល ពិនិត្យ និងអនុម័តសំណើសុំច្បាប់ឈប់សម្រាក ថែមម៉ោង ឬការស្នើសុំបំពេញម៉ោងស្កែនដែលខកខាន ព្រមទាំងរូបភាពភស្តុតាងភ្ជាប់មកជាមួយ។\n• ការគ្រប់គ្រងសុវត្ថិភាពឧបករណ៍៖ កំណត់ការចូលប្រើប្រាស់ត្រឹមទូរស័ព្ទតែមួយ បង្ហាញបញ្ជីឧបករណ៍ដែលកំពុងដំណើរការ និងអនុញ្ញាតឱ្យបុគ្គលិក ឬរដ្ឋបាលអាចផ្ដាច់សម័យប្រជុំដែលមិនស្គាល់ពីចម្ងាយ។\n• ការជូនដំណឹងរហ័សតាម Telegram៖ បញ្ជូនសារជូនដំណឹងភ្លាមៗជាមួយអត្តលេខបុគ្គលិក ម៉ោងវត្តមាន និងរូបភាពភស្តុតាងទៅកាន់ Telegram Channel របស់ថ្នាក់ដឹកនាំតាមរយៈ Telegram Bot API។\n• ការទាញយក និងបោះពុម្ពរបាយការណ៍៖ បង្កើតរបាយការណ៍វត្តមានប្រចាំថ្ងៃ ប្រចាំសប្តាហ៍ ប្រចាំខែ និងប្រចាំឆ្នាំ ជាទម្រង់ PDF សម្រាប់ការបោះពុម្ព និងការងាររដ្ឋបាល។\n• ការកំណត់ប្រព័ន្ធតាមរយៈពពក៖ ទទួលបានតំណភ្ជាប់ជំនួយផ្លូវការ និងបណ្តាញទំនាក់ទំនងទាន់សម័យពី Backend ដោយពុំចាំបាច់ដំឡើងកំណែកម្មវិធីថ្មីឡើងវិញឡើយ។\n\nយើងសូមធានាយ៉ាងដាច់ខាតថាមិនលក់ ជួល ឬចែករំលែកទិន្នន័យផ្ទាល់ខ្លួនទៅកាន់ភាគីទីបី ក្រុមហ៊ុនពាណិជ្ជកម្ម ឬបណ្តាញផ្សាយពាណិជ្ជកម្មឡើយ។",
    },
    {
      title: "4. ការរក្សាទុក សុវត្ថិភាពទិន្នន័យ និងប្រព័ន្ធ Cloud",
      body: "• ហេដ្ឋារចនាសម្ព័ន្ធទិន្នន័យពពក (Distributed Cloud Database)៖ ប្រព័ន្ធទិន្នន័យ Cloud SQL កម្រិតខ្ពស់សម្រាប់រក្សាទុកព័ត៌មានបុគ្គលិក កំណត់ត្រាវត្តមាន សំណើច្បាប់ និងការកំណត់សាខា។\n• ប្រព័ន្ធផ្ទុកឯកសារពពកដែលបានបំប្លែងកូដ (Encrypted Cloud Object Storage)៖ កន្លែងផ្ទុកឯកសារប្រកបដោយសុវត្ថិភាពខ្ពស់ សម្រាប់រក្សាទុករូបថតវត្តមាន និងរូបតំណាងបុគ្គលិក។\n• ប្រព័ន្ធទិន្នន័យសុវត្ថិភាពក្នុងឧបករណ៍ (Sandboxed Local Storage & Offline Continuity)៖ អង្គចងចាំសុវត្ថិភាពក្នុងទូរស័ព្ទ ផ្តល់នូវល្បឿនលឿនគ្មានទាក់ ដំណើរការបានពេលគ្មានអ៊ីនធឺណិត និងធ្វើសមកាលកម្មទិន្នន័យទៅវិញទៅមកជាមួយប្រព័ន្ធ Cloud។\n• ការការពារពាក្យសម្ងាត់៖ ពាក្យសម្ងាត់ទាំងអស់ត្រូវបានការពារដោយក្បួនបំប្លែងកូដសម្ងាត់ស្ដង់ដារ bcrypt ដោយគ្មានការរក្សាទុកពាក្យសម្ងាត់សុទ្ធនៅក្នុង Database ឡើយ។\n• សុវត្ថិភាពពេលបញ្ជូន (TLS 1.3)៖ រាល់ការបញ្ជូនទិន្នន័យរវាងកម្មវិធីទូរស័ព្ទ និងម៉ាស៊ីនបម្រើ Backend ត្រូវបានការពារដោយពិធីសារសុវត្ថិភាព HTTPS / TLS 1.3 ទំនើប។\n• សុវត្ថិភាពសម័យប្រជុំឧបករណ៍៖ សម័យប្រជុំត្រូវបានចងភ្ជាប់នឹងលេខសម្គាល់សម្ភារៈទូរស័ព្ទ (Hardware Signature) និងអាចលុបចោលពីចម្ងាយបានគ្រប់ពេល។",
    },
    {
      title: "5. ការបែងចែកទិន្នន័យតាមសាខា និង System ID",
      body: "ស្ថាបត្យកម្មកម្មវិធីគាំទ្រការបែងចែកសាខាការងារយ៉ាងដាច់ដោយឡែក (ដូចជា system-0001, system-0002)។ ព័ត៌មានបុគ្គលិក កាលវិភាគវត្តមាន សំណើច្បាប់ និងសម័យប្រជុំឧបករណ៍ ត្រូវបានការពារយ៉ាងតឹងរ៉ឹងទៅតាម System ID របស់ក្រុមហ៊ុននីមួយៗ ដោយធានាមិនឱ្យមានការបែកធ្លាយទិន្នន័យឆ្លងកាត់គ្នានោះឡើយ។",
    },
    {
      title: "6. ការគ្រប់គ្រងកញ្ចប់សេវាសាខា (Subscription Guard)",
      body: "ដើម្បីធានាសុវត្ថិភាពទិន្នន័យសាជីវកម្ម ប្រព័ន្ធ Backend ត្រួតពិនិត្យសុពលភាពកញ្ចប់សេវាកម្មសាខាដោយស្វ័យប្រវត្ត។ ប្រសិនបើសាខាណាមួយផុតកំណត់សេវា ប្រព័ន្ធនឹងបញ្ជូនបុគ្គលិកសាខានោះទៅកាន់ផ្ទាំង Non-Subscription ដោយសុវត្ថិភាព ដើម្បីទំនាក់ទំនងបន្តសុពលភាពជាមួយផ្នែកជំនួយផ្លូវការ។",
    },
    {
      title: "7. សេវាកម្មសហគ្រាសតតិយភាគី",
      body: "កម្មវិធីនេះភ្ជាប់ទំនាក់ទំនងតែជាមួយសេវាកម្មពពកសហគ្រាសសំខាន់ៗដែលគួរឱ្យទុកចិត្តប៉ុណ្ណោះ៖\n\n• ហេដ្ឋារចនាសម្ព័ន្ធ Cloud ស្តង់ដារសុវត្ថិភាពអន្តរជាតិ៖ ផ្តល់នូវការរក្សាទុកទិន្នន័យប្រកបដោយសុវត្ថិភាពខ្ពស់ និងការផ្ទុកឯកសារមេឌៀដែលបានបំប្លែងកូដ។\n• Telegram Bot API៖ សម្រាប់បញ្ជូនសារដំណឹងវត្តមាន និងសំណើច្បាប់ទៅកាន់ Telegram Channel របស់រដ្ឋបាលក្រុមហ៊ុន។\n• ក្របខណ្ឌ Expo Framework៖ សម្រាប់ការគ្រប់គ្រងកាមេរ៉ាស្កែន កូអរដោនេ GPS និងសតិបម្រុងសុវត្ថិភាពក្នុងទូរស័ព្ទ។\n\nកម្មវិធីនេះគ្មានការបង្កប់កូដពាណិជ្ជកម្ម (Ads), Tracking Pixels ឬឧបករណ៍វិភាគទិន្នន័យពាណិជ្ជកម្មណាមួយឡើយ។",
    },
    {
      title: "8. សិទ្ធិរបស់អ្នកប្រើប្រាស់ និងការគ្រប់គ្រងគណនី",
      body: "បុគ្គលិក និងរដ្ឋបាលមានសិទ្ធិពេញលេញលើទិន្នន័យការងាររបស់ខ្លួន៖\n\n• ការពិនិត្យ និងកែប្រែ៖ អាចចូលពិនិត្យប្រវត្តិរូប កែប្រែព័ត៌មានទំនាក់ទំនង និងផ្លាស់ប្តូរពាក្យសម្ងាត់នៅក្នុងកម្មវិធីបានគ្រប់ពេល។\n• ការគ្រប់គ្រងឧបករណ៍៖ អាចមើលបញ្ជីឧបករណ៍ដែលកំពុងចូលប្រើប្រាស់ និងចុចផ្ដាច់ឧបករណ៍ដែលមិនស្គាល់ពីចម្ងាយ។\n• ការលុបគណនី៖ នៅពេលបញ្ចប់ការងារ រដ្ឋបាលក្រុមហ៊ុនអាចផ្អាកគណនី លុបសម័យប្រជុំ និងដោះការចងភ្ជាប់ឧបករណ៍។ សម្រាប់សំណួរ សូមទាក់ទងរដ្ឋបាលប្រព័ន្ធ ឬអ៊ីមែល support@sshgroups.com។",
    },
    {
      title: "9. រយៈពេលនៃការរក្សាទុកទិន្នន័យ",
      body: "កំណត់ត្រាវត្តមាន ប្រវត្តិសំណើ និងកំណត់ត្រាសុវត្ថិភាពឧបករណ៍ ត្រូវបានរក្សាទុកស្របតាមគោលការណ៍រដ្ឋបាលក្រុមហ៊ុន សវនកម្ម និងច្បាប់ការងារជាធរមាន។ នៅពេលគណនីត្រូវបានលុបជាផ្លូវការ ទិន្នន័យផ្ទាល់ខ្លួននឹងត្រូវលុប ឬបំប្លែងទៅជាអនាមិកភ្លាមៗ។",
    },
    {
      title: "10. ព័ត៌មានទំនាក់ទំនង និងជំនួយបច្ចេកទេស",
      body: "ក្រុមហ៊ុន SSH Group Co., Ltd.\nទីតាំង៖ រាជធានីភ្នំពេញ, ព្រះរាជាណាចក្រកម្ពុជា\nអ៊ីមែល៖ support@sshgroups.com\nជំនួយតាម Telegram៖ https://t.me/sshgroup168\nគេហទំព័រ៖ www.sshgroups.com\n\nប្រសិនបើលោកអ្នកមានសំណួរ បញ្ហាបច្ចេកទេស ឬចម្ងល់ទាក់ទងនឹងគោលការណ៍ឯកជនភាពនេះ សូមទាក់ទងមកកាន់ក្រុមការងាររបស់យើងខ្ញុំដោយផ្ទាល់តាមរយៈបណ្តាញជំនួយផ្លូវការ។",
    },
  ],
  fr: [
    {
      title: "1. Développeur et introduction",
      body: "L'application mobile SSH Group Staff (package : com.sshgroups.staffapp) est développée et exploitée par SSH Group Co., Ltd. (Phnom Penh, Cambodge). Cette application d'entreprise est spécialement conçue pour la gestion interne des effectifs, le pointage de présence ultra-rapide en 0 ms par code QR, la vérification de géorepérage GPS Haversine, les journaux d'horaires, les demandes de congé ou d'oubli de pointage, la liaison de session matérielle d'appareil et la génération de rapports de présence. Cette politique de confidentialité détaille notre engagement transparent à protéger les données du personnel, en précisant comment les informations opérationnelles sont collectées, traitées, synchronisées et sécurisées.",
    },
    {
      title: "2. Informations que nous collectons",
      body: "Afin d'assurer une gestion fiable des effectifs et l'intégrité des présences, l'application collecte et traite les informations suivantes :\n\n• Informations de compte et de profil : ID Employé (Staff ID), ID Système (identifiant de succursale, ex. system-0001, system-0002), nom complet de l'employé, nom d'utilisateur unique, identifiants chiffrés par mot de passe (bcrypt hash), rôle organisationnel attribué (Owner, Admin, Staff, Leave), poste, date de naissance, adresse e-mail, numéro de téléphone et photo de profil.\n• Caméra et scan optique de QR code : L'accès à la caméra est sollicité exclusivement pour le scan instantané (0 ms) de code QR lors de l'enregistrement d'arrivée ou de départ, ainsi que pour la prise de photos justificatives facultatives lors des demandes de présence. La caméra n'est jamais activée en arrière-plan ni sans action explicite de l'utilisateur.\n• Localisation et vérification du géorepérage (Geofence) : Les coordonnées GPS précises sont consultées exclusivement au moment exact où l'employé effectue un pointage d'arrivée ou de départ. Les coordonnées de l'appareil sont validées à l'aide de la formule Haversine par rapport aux périmètres enregistrés des locaux de la succursale (latitude, longitude et rayon en mètres). Le système détecte les applications de simulation de position (isMocked) et les réseaux virtuels privés (VPN) afin de prévenir toute falsification de présence. La localisation en arrière-plan n'est JAMAIS suivie ni enregistrée.\n• Journaux de présence et demandes séquentielles : Horodatages des pointages d'arrivée et de départ, total des heures de travail quotidiennes, statut de présence et identifiants séquentiels de demandes attribués à chaque employé (ex. {system_id}-ATT-0000-0001 et {system_id}-REQ-0000-0001), incluant motifs de congé, remarques et décisions d'approbation.\n• Liaison matérielle et sessions d'appareils (DeviceSession) : Fabricant de l'appareil, modèle matériel, système d'exploitation, adresse IP et UUID de session unique pour empêcher le partage d'identifiants et appliquer la politique de sécurité d'une session active par appareil unique.\n• Stockage local sécurisé : Base de données locale sécurisée en bac à sable (Sandboxed Local Storage) et stockage persistant protégé (AsyncStorage, Expo SecureStore) assurant la continuité hors ligne et le rendu instantané de l'interface.",
    },
    {
      title: "3. Comment nous utilisons vos informations",
      body: "Nous traitons les données des employés strictement pour des finalités professionnelles légitimes et de gestion des ressources humaines :\n\n• Authentification et isolation des succursales : Authentification des identifiants, émission de jetons JWT sécurisés, application de la segmentation par ID Système et prévention de tout accès non autorisé entre entreprises.\n• Vérification des présences en 0 ms : Validation locale instantanée des codes QR, confirmation du respect du rayon géographique du lieu de travail et vérification de la conformité de l'appareil.\n• Gestion du cycle des demandes : Réception, examen et approbation des demandes de congés, d'heures supplémentaires et d'oubli de pointage accompagnées de photos justificatives.\n• Liaison des appareils matériels : Application d'une session active unique par compte, affichage des appareils connectés et possibilité pour l'employé ou l'administrateur de révoquer à distance les sessions non reconnues.\n• Alertes administratives instantanées par Telegram : Envoi de notifications en temps réel avec ID Employé, horodatages de présence et photos justificatives vers les canaux Telegram autorisés de la direction via l'API Telegram Bot.\n• Rapports d'entreprise et impression : Compilation de synthèses journalières, hebdomadaires, mensuelles et annuelles avec fonctions de recherche, filtrage et génération de PDF pour impression.\n• Configuration dynamique du système : Récupération dynamique depuis le Cloud des liens d'assistance officiels et canaux de support sans nécessiter de mise à jour de l'application mobile.\n\nNous nous engageons formellement à ne jamais vendre, louer, monétiser ni céder vos données personnelles à des tiers commerciaux, courtiers en données ou réseaux publicitaires.",
    },
    {
      title: "4. Stockage, sécurité et architecture Cloud",
      body: "• Infrastructure de base de données Cloud distribuée : Base de données SQL Cloud hautement disponible pour la gestion sécurisée et en temps réel des profils, journaux de présence, demandes et configurations de succursale.\n• Stockage d'objets Cloud chiffré : Stockage Cloud sécurisé haute performance pour les photos de présence et avatars du personnel.\n• Stockage local sécurisé et continuité hors ligne : Stockage sécurisé en bac à sable sur l'appareil assurant un fonctionnement sans latence en mode hors ligne avec synchronisation automatique vers le Cloud.\n• Hachage fort des mots de passe : Tous les mots de passe sont salés et hachés avec le standard de l'industrie bcrypt avant stockage ; aucun mot de passe brut n'est conservé en clair.\n• Sécurité de la couche de transport (TLS 1.3) : Toutes les communications entre l'application mobile et les API backend sont chiffrées via HTTPS / TLS 1.3.\n• Contrôle de session matérielle : Les sessions d'appareils sont liées à des signatures matérielles uniques et peuvent être révoquées à distance à tout moment.",
    },
    {
      title: "5. Isolation multi-succursales et System ID",
      body: "L'architecture de l'application applique un cloisonnement strict entre les succursales de l'entreprise (ex. system-0001, system-0002). Les profils du personnel, les plannings de présence, les demandes d'approbation et les sessions d'appareils sont isolés par ID Système de l'entreprise, garantissant une confidentialité totale et l'absence de chevauchement de données entre entités distinctes.",
    },
    {
      title: "6. Protection de l'abonnement de succursale (Subscription Guard)",
      body: "Afin de protéger les données de l'organisation, le serveur vérifie automatiquement la validité de l'abonnement de la succursale. Si l'abonnement expire, les employés de cette succursale sont redirigés en toute sécurité vers l'écran Non-Subscription avec les canaux d'assistance officiels, évitant ainsi tout accès non autorisé jusqu'au renouvellement.",
    },
    {
      title: "7. Intégrations de services d'entreprise tiers",
      body: "L'application intègre exclusivement les services Cloud d'entreprise essentiels et sécurisés :\n\n• Infrastructure Cloud d'entreprise : Hébergement sécurisé de base de données, réseau périphérique à haute disponibilité et stockage de médias chiffré.\n• Telegram Bot API : Transmission interne sécurisée des alertes administratives de présence en temps réel.\n• Expo Framework : Bibliothèques natives pour le scan optique par caméra, la géolocalisation GPS et le stockage matériel sécurisé.\n\nL'application ne contient AUCUN SDK publicitaire, pixel de suivi ou outil d'analyse comportementale commerciale.",
    },
    {
      title: "8. Droits des utilisateurs et gestion des comptes",
      body: "Les employés et les administrateurs disposent d'un contrôle complet sur leurs données professionnelles :\n\n• Consultation et mise à jour : Possibilité de consulter son profil personnel, de mettre à jour ses coordonnées et de changer son mot de passe directement dans l'application.\n• Gestion des sessions : Consultation de tous les appareils connectés et déconnexion à distance des sessions suspectes ou inutilisées.\n• Clôture de compte : À la fin du contrat de travail, l'administrateur peut désactiver le compte, révoquer les sessions actives et dissocier les appareils. Pour toute question, contactez votre administrateur système ou écrivez à support@sshgroups.com.",
    },
    {
      title: "9. Conservation des données et normes d'audit",
      body: "Les journaux de présence, l'historique des demandes et les journaux d'audit matériel sont conservés conformément aux règles de gouvernance interne, aux exigences d'audit et aux lois du travail en vigueur. Les identifiants et sessions des comptes désactivés sont promptement supprimés ou anonymisés.",
    },
    {
      title: "10. Contact et assistance technique",
      body: "SSH Group Co., Ltd.\nAdresse : Phnom Penh, Cambodge\nE-mail : support@sshgroups.com\nAssistance Telegram : https://t.me/sshgroup168\nSite Web : www.sshgroups.com\n\nPour toute question, assistance technique ou demande relative à la confidentialité, veuillez contacter notre équipe directement via nos canaux d'assistance officiels.",
    },
  ],
};
