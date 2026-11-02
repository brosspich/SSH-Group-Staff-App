import Constants from "expo-constants";
import { Platform } from "react-native";

const baseVersion =
  Constants.expoConfig?.version || Constants.manifest?.version || "1.0.0";
const appVersionCode =
  (Platform.OS === "ios"
    ? Constants.expoConfig?.ios?.buildNumber ||
      Constants.manifest?.ios?.buildNumber
    : Constants.expoConfig?.android?.versionCode ||
      Constants.manifest?.android?.versionCode) ||
  Constants.expoConfig?.ios?.buildNumber ||
  Constants.expoConfig?.android?.versionCode;
const appVersion = appVersionCode
  ? `${baseVersion}.${appVersionCode}`
  : baseVersion;
export interface PolicySection {
  title: string;
  body: string;
}

export type PolicyLang = "en" | "zh" | "km";

export const PRIVACY_POLICY_LAST_UPDATED: Record<PolicyLang, string> = {
  en: `Last Updated App Version : ${appVersion}`,
  zh: `最后更新应用版本 ：${appVersion}`,
  km: `ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ កំណែកម្មវិធី ៖ ${appVersion}`,
};

export const PRIVACY_POLICY_DATA: Record<PolicyLang, PolicySection[]> = {
  en: [
    {
      title: "1. Developer & Introduction",
      body: "The SSH Group Staff App (package: com.sshgroups.staffapp) is developed and operated by SSH Group Co., Ltd. (Phnom Penh, Cambodia). This enterprise application is designed to facilitate employee management, QR code attendance tracking, shift logs, leave/attendance requests, and internal workforce reporting. This Privacy Policy details our commitment to protecting staff privacy, explaining how personal and operational data is collected, processed, stored, and safeguarded.",
    },
    {
      title: "2. Information We Collect",
      body: "To deliver reliable workforce management services, the application collects and processes the following information:\n\n• Account & Profile Information: Staff ID, System ID (company branch code, e.g. system-0001, system-0002), employee full name, username, encrypted password credentials, position, assigned role, email address, phone number, joined date, and profile photo.\n• Camera Access & QR Scanning: Device camera permissions are requested solely for optical scanning of dynamic QR codes during attendance check-in / check-out. No video feeds or photographs are recorded, broadcast, or stored without direct user interaction.\n• Location Data & Geofence Verification: Precise and coarse location access (GPS/network) is accessed solely at the exact instant an employee clocks in or out to verify physical presence within authorized company workplace geofence radius. The application does not monitor, track, or record background location when the app is not actively performing an attendance action.\n• Attendance & Request Records: Timestamps of check-in and check-out logs, total daily work durations, attendance adjustment requests, overtime, and leave applications (including date spans, reason subjects, remarks, and approval statuses).\n• Device Information & Active Sessions: Device model, hardware manufacturer, operating system version, and unique device session identifiers obtained via Expo Device to manage authorized devices, enforce single-device active session policies, and detect unauthorized account access.\n• Local Storage & Cryptographic Cache: Access to hardware-backed secure storage via Expo SecureStore and AsyncStorage to securely cache authentication tokens, user preferences, and offline report data.",
    },
    {
      title: "3. How We Use Your Information",
      body: "We process collected staff information strictly for legitimate organizational and business purposes:\n\n• User Authentication & Access Control: Validating credentials, enforcing password policies, managing multi-branch access rights, and verifying active account status.\n• Attendance Management: Accurately calculating work hours, tracking daily check-ins/check-outs, and compiling employee attendance statistics.\n• Request & Leave Processing: Managing, reviewing, and approving staff leave requests, shift modifications, and attendance corrections.\n• Security & Device Management: Enforcing active device limits, displaying authorized device lists, and allowing employees to remotely revoke inactive sessions.\n• Reporting & Document Export: Generating official Daily, Weekly, Monthly, and Annual PDF reports for internal workforce accounting and printing.\n• Administrative Operational Alerts: Sending automated operational notifications to authorized management Telegram channels via secure Telegram Bot API.\n\nWe strictly do not sell, rent, monetize, or disclose your personal or employment information to commercial third parties or external marketing networks.",
    },
    {
      title: "4. Data Storage, Security & Cloud Backend",
      body: "• Cloud Infrastructure: All backend services and operational databases are hosted on Supabase (PostgreSQL enterprise cloud database).\n• Row-Level Security (RLS): Database tables are protected by granular Row-Level Security policies ensuring only authenticated staff and administrators with proper authorization can read or write relevant records.\n• Cryptographic Password Protection: Passwords are salted and securely hashed using bcrypt prior to database insertion; raw passwords are never stored or transmitted in plain text.\n• Encryption in Transit: All client-to-server communications are conducted over modern, TLS/HTTPS 1.3 encrypted network connections.\n• Secure On-Device Storage: Authentication session tokens and security credentials are stored in hardware-backed secure storage using Expo SecureStore.",
    },
    {
      title: "5. Multi-Branch & Multi-System Isolation",
      body: "The application supports multi-system workforce segregation (such as system-0001, system-0002, and future company branches). Staff profiles, attendance records, and request queues are partitioned by company system to ensure data isolation between different operational branches.",
    },
    {
      title: "6. Third-Party Integrations & Services",
      body: "The application relies on a minimal set of trusted enterprise services:\n\n• Supabase Inc.: Database hosting, user authentication, and real-time database update subscriptions.\n• Telegram API: Used strictly for outbound internal administrative notification dispatching regarding attendance events and requests.\n• Expo Framework: Native device integration libraries for camera, location, storage, and document sharing.\n\nNo advertising SDKs, tracking pixels, behavioral analytical trackers, or third-party marketing tools are present in this application.",
    },
    {
      title: "7. User Rights & Account Deletion",
      body: "Employees retain clear rights regarding their personal data:\n\n• Data Review & Correction: Staff can review their account profile and update permitted contact information or passwords directly in the application.\n• Account Deletion: Upon termination or conclusion of employment, employees or organization administrators may request account deletion and removal of associated personal device sessions. To request account deletion, please contact your company system administrator or send an email to support@sshgroups.com.",
    },
    {
      title: "8. Data Retention",
      body: "Attendance logs, request histories, and time tracking records are retained in compliance with SSH Group employment policies, audit standards, and applicable labor regulations. When an account is decommissioned, personal credentials and active sessions are promptly deleted or anonymized.",
    },
    {
      title: "9. Policy Updates",
      body: "We may update this Privacy Policy periodically to reflect new features, infrastructure improvements, or legal compliance updates. Changes take effect immediately upon updating the policy in the application.",
    },
    {
      title: "10. Contact Us",
      body: "SSH Group Co., Ltd.\nAddress: Phnom Penh, Cambodia\nEmail: support@sshgroups.com\nWebsite: www.sshgroups.com\n\nIf you have any questions, inquiries, or concerns regarding this Privacy Policy or your data, please contact our support team directly.",
    },
  ],
  zh: [
    {
      title: "1. 开发者与引言",
      body: "SSH Group Staff 移动应用程序（包名：com.sshgroups.staffapp）由位于柬埔寨金边的 SSH Group Co., Ltd. 开发并运营。本企业级应用程序旨在为员工提供考勤管理、动态二维码打卡、工时记录、考勤与请假审批申请以及内部员工报表管理服务。本隐私政策详细说明我们如何收集、使用、存储和保护您的个人及工作信息。",
    },
    {
      title: "2. 我们收集的信息",
      body: "为了提供稳定高效的企业考勤管理服务，本应用收集并处理以下信息：\n\n• 账户与个人信息：员工编号（Staff ID）、系统分支编号（System ID，如 system-0001、system-0002）、全名、用户名、加密密码凭证、职务、分配角色、电子邮件地址、联系电话、入职日期及个人头像照片。\n• 摄像头与扫码功能：本应用请求摄像头权限仅用于在员工签到/签退时扫描动态考勤二维码。应用绝不会在未经用户直接操作的情况下录制、上传或存储任何相片或视频。\n• 位置信息与电子围栏验证：仅在员工执行签到或签退操作的瞬间请求粗略与精确定位权限（GPS），用于验证员工是否处于公司授权的考勤区域内。本应用不会在后台持续监控、记录或上传您的实时地理位置。\n• 考勤打卡与审批记录：签到与签退时间戳、每日工作时长、考勤补签申请、加班申请、请假申请（包括日期范围、申请事由、备注说明及审批状态）。\n• 设备与活动会话数据：设备型号、操作系统版本、制造商信息及通过 Expo Device 生成的设备会话标识符，用于授权设备管理、单设备登录策略控制及防止账户未经授权冒用。\n• 本地存储与加密缓存：通过 Expo SecureStore 及 AsyncStorage 访问设备存储，用于安全缓存身份令牌、用户偏好设置及离线报表数据。",
    },
    {
      title: "3. 我们如何使用您的信息",
      body: "我们处理所收集的员工信息仅用于正当的企业管理目的：\n\n• 员工身份验证与权限控制：验证登录凭证、执行密码安全策略、确认账户激活状态及管理各分支权限。\n• 考勤与工时管理：精准计算员工出勤率、统计每日上下班记录并生成工时报表。\n• 申请与审批流程处理：供管理人员审核及批复员工考勤补录、加班和请假申请。\n• 账号安全与设备管理：限制多设备同时在线，提供已授权设备列表，并允许员工远程注销闲置或异常设备。\n• 报表生成与文档导出：生成用于内部核算与打印的日报、周报、月报和年报 PDF 报表。\n• 内部实时通知调度：通过安全的 Telegram Bot API 向公司管理频道发送内部考勤通知。\n\n我们郑重承诺，绝不向任何第三方广告商或营销机构出售、出租、出售或披露您的个人数据。",
    },
    {
      title: "4. 数据存储、安全与云端架构",
      body: "• 云端数据库托管：应用程序使用 Supabase（PostgreSQL 企业级云数据库平台）存储所有业务数据与考勤日志。\n• 行级安全策略（RLS）：数据库表受到严格的行级安全控制，确保只有获得合法授权的员工和管理员才能读取或修改所属数据。\n• 密码加盐哈希加密：用户密码在存入数据库前均使用行业标准 bcrypt 进行加盐哈希加密处理，服务器端绝不保存或显示明文密码。\n• 传输过程加密：应用与服务器之间的所有数据传输均采用现代 TLS/HTTPS 1.3 加密协议。\n• 本地硬件密钥保护：访问令牌及敏感凭证使用硬件级加密的 Expo SecureStore 安全保存在您的移动设备本地。",
    },
    {
      title: "5. 多分部与多系统数据隔离",
      body: "本应用支持多分公司与多分部架构（例如 system-0001、system-0002 等）。员工资料、考勤日志及申请队列均按照所属系统严格隔离，确保不同分部之间的数据独立与保密。",
    },
    {
      title: "6. 第三方服务集成",
      body: "本应用仅集成必要的企业级基础设施服务：\n\n• Supabase Inc.：提供数据库存储、身份认证及实时变更流服务。\n• Telegram API：用于向内部管理频道发送有关打卡和申请的行政通知。\n• Expo 框架：提供摄像头、位置、硬件存储及文档分享等原生设备能力。\n\n应用内不包含任何第三方广告 SDK、用户行为分析追踪器或数据经纪人插件。",
    },
    {
      title: "7. 用户权利与账户注销",
      body: "员工对自身数据拥有明确的权利：\n\n• 查阅与修改：您可在应用内直接查看个人资料，并修改授权的联系方式或密码。\n• 账户删除申请：在离职或劳动关系解除后，员工或系统管理员有权申请注销账户并清除已关联的设备会话。申请注销请联系所属系统管理员或发送邮件至 support@sshgroups.com。",
    },
    {
      title: "8. 数据保留政策",
      body: "考勤记录、工时统计及审批历史将根据 SSH Group 企业管理规定、审计标准及适用劳动法规保留。当账户正式注销时，其个人凭据与活动会话将被永久删除或匿名化处理。",
    },
    {
      title: "9. 隐私政策的更新",
      body: "我们可能会适时更新本隐私政策，以适应应用功能调整、技术改进或监管法规的变化。更新后的政策一经在应用内发布即刻生效。",
    },
    {
      title: "10. 联系方式",
      body: "SSH Group Co., Ltd.\n地址：柬埔寨金边\n电子邮箱：support@sshgroups.com\n官方网站：www.sshgroups.com\n\n如对本隐私政策或个人数据处理有任何疑问或建议，请随时与我们联系。",
    },
  ],
  km: [
    {
      title: "1. អ្នកអភិវឌ្ឍន៍ និងការណែនាំ",
      body: "កម្មវិធីទូរស័ព្ទ SSH Group Staff App (កញ្ចប់កម្មវិធី៖ com.sshgroups.staffapp) ត្រូវបានអភិវឌ្ឍ និងដំណើរការដោយក្រុមហ៊ុន SSH Group Co., Ltd. (រាជធានីភ្នំពេញ ប្រទេសកម្ពុជា)។ កម្មវិធីកម្រិតសហគ្រាសនេះ ត្រូវបានរចនាឡើងដើម្បីគ្រប់គ្រងបុគ្គលិក កត់ត្រាវត្តមានតាមរយៈការស្កែន QR Code ការពិនិត្យម៉ោងបំពេញការងារ ការស្នើសុំការអនុញ្ញាតច្បាប់ និងការទាញយករបាយការណ៍វត្តមាន។ គោលការណ៍ឯកជនភាពនេះ ពន្យល់យ៉ាងច្បាស់អំពីការប្តេជ្ញាចិត្តរបស់យើងក្នុងការការពារព័ត៌មានផ្ទាល់ខ្លួន និងរបៀបដែលទិន្នន័យត្រូវបានប្រមូល ប្រើប្រាស់ រក្សាទុក និងការពារ។",
    },
    {
      title: "2. ព័ត៌មានដែលយើងប្រមូល",
      body: "ដើម្បីធានាដំណើរការការងារគ្រប់គ្រងបុគ្គលិកប្រកបដោយប្រសិទ្ធភាព កម្មវិធីប្រមូល និងដំណើរការព័ត៌មានដូចខាងក្រោម៖\n\n• ព័ត៌មានគណនី និងប្រវត្តិរូប៖ អត្តលេខបុគ្គលិក (Staff ID), លេខសម្គាល់ប្រព័ន្ធសាខា (System ID ដូចជា system-0001, system-0002), ឈ្មោះពេញ, ឈ្មោះគណនី (Username), ពាក្យសម្ងាត់ដែលបានបំប្លែងកូដសុវត្ថិភាព, តួនាទី, មុខតំណែង, អាសយដ្ឋានអ៊ីមែល, លេខទូរស័ព្ទ, ថ្ងៃចូលបម្រើការងារ និងរូបថតប្រវត្តិរូប។\n• ការប្រើប្រាស់កាមេរ៉ា និងការស្កែន QR Code៖ ការអនុញ្ញាតកាមេរ៉ា ត្រូវបានប្រើប្រាស់សម្រាប់តែការស្កែន QR Code ពេលបុគ្គលិក Check-in ឬ Check-out ប៉ុណ្ណោះ។ កម្មវិធីមិនថត ឬរក្សាទុកវីដេអូ ឬរូបថតដោយគ្មានការបញ្ជាផ្ទាល់ពីអ្នកប្រើប្រាស់នោះឡើយ។\n• ព័ត៌មានទីតាំង (Geofence Verification)៖ កម្មវិធីស្នើសុំការអនុញ្ញាតទីតាំង (GPS) តែនៅពេលបុគ្គលិកចុចកត់ត្រាវត្តមានប៉ុណ្ណោះ ដើម្បីផ្ទៀងផ្ទាត់វត្តមានពិតប្រាកដនៅក្នុងបរិវេណក្រុមហ៊ុនដែលបានកំណត់។ កម្មវិធីមិនតាមដានទីតាំងរបស់អ្នកនៅផ្ទៃខាងក្រោយ (Background) ឡើយ។\n• កំណត់ត្រាវត្តមាន និងសំណើសុំច្បាប់៖ ពេលវេលាចុះវត្តមានចូល/ចេញ, ម៉ោងការងារសរុប, សំណើសុំកែប្រែវត្តមាន, សំណើសុំថែមម៉ោង, និងសំណើសុំច្បាប់សម្រាក (រួមទាំងកាលបរិច្ឆេទ មូលហេតុ និងស្ថានភាពអនុម័ត)។\n• ទិន្នន័យឧបករណ៍ និងសម័យប្រជុំ (Session)៖ ម៉ូឌែលទូរស័ព្ទ, កំណែប្រព័ន្ធប្រតិបត្តិការ និងលេខសម្គាល់ឧបករណ៍តាមរយៈ Expo Device ដើម្បីគ្រប់គ្រងការអនុញ្ញាតឧបករណ៍ ធានាសុវត្ថិភាពគណនី និងការពារការលួចប្រើប្រាស់។\n• ការរក្សាទុកក្នុងឧបករណ៍ និងសតិបណ្ដោះអាសន្ន៖ ការរក្សាទុកទិន្នន័យក្នុងឧបករណ៍ដោយប្រើ Expo SecureStore និង AsyncStorage ដើម្បីរក្សាថូខិនចូលប្រើប្រាស់ និងទិន្នន័យរបាយការណ៍ក្រៅបណ្តាញ (Offline Cache)។",
    },
    {
      title: "3. របៀបដែលយើងប្រើប្រាស់ព័ត៌មានរបស់អ្នក",
      body: "យើងដំណើរការព័ត៌មានបុគ្គលិកសម្រាប់តែគោលបំណងអាជីវកម្ម និងការគ្រប់គ្រងស្របច្បាប់ប៉ុណ្ណោះ៖\n\n• ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ៖ ផ្ទៀងផ្ទាត់ការចូលប្រើប្រាស់ ពិនិត្យស្ថានភាពគណនី និងកំណត់សិទ្ធិប្រើប្រាស់តាមសាខាការងារនីមួយៗ។\n• ការគ្រប់គ្រងវត្តមាន៖ គណនាម៉ោងការងារយ៉ាងត្រឹមត្រូវ តាមដានវត្តមានប្រចាំថ្ងៃ និងបង្កើតស្ថិតិការងារបុគ្គលិក។\n• ដំណើរការសំណើច្បាប់៖ ផ្តល់ជូនថ្នាក់គ្រប់គ្រងនូវព័ត៌មានដើម្បីពិនិត្យ និងអនុម័តសំណើសុំច្បាប់ ឬការកែសម្រួលវត្តមាន។\n• សុវត្ថិភាពឧបករណ៍៖ កំណត់ចំនួនឧបករណ៍ដែលអាចចូលប្រើប្រាស់ និងអនុញ្ញាតឱ្យបុគ្គលិកអាចចាកចេញពីឧបករណ៍ដែលមិនស្គាល់ពីចម្ងាយ។\n• ការទាញយករបាយការណ៍៖ បង្កើតរបាយការណ៍ជាទម្រង់ PDF ប្រចាំថ្ងៃ ប្រចាំសប្តាហ៍ ប្រចាំខែ និងប្រចាំឆ្នាំ សម្រាប់ការបោះពុម្ព និងការងាររដ្ឋបាល។\n• ការជូនដំណឹងប្រតិបត្តិការ៖ បញ្ជូនសារជូនដំណឹងរហ័សអំពីវត្តមានបុគ្គលិកទៅកាន់ Telegram Channel របស់ថ្នាក់គ្រប់គ្រងតាមរយៈ Telegram Bot API។\n\nយើងសូមធានាយ៉ាងដាច់ខាតថាមិនលក់ ជួល ឬចែករំលែកទិន្នន័យបុគ្គលិកទៅកាន់ភាគីទីបីសម្រាប់គោលបំណងពាណិជ្ជកម្មឡើយ។",
    },
    {
      title: "4. ការរក្សាទុក សុវត្ថិភាពទិន្នន័យ និងប្រព័ន្ធពពក",
      body: "• ប្រព័ន្ធមូលដ្ឋានទិន្នន័យពពក៖ ទិន្នន័យទាំងអស់ត្រូវបានរក្សាទុកនៅលើ Supabase (PostgreSQL Cloud Database ប្រកបដោយសុវត្ថិភាពខ្ពស់)។\n• សុវត្ថិភាពកម្រិតជួរទិន្នន័យ (RLS)៖ តារាងទិន្នន័យត្រូវបានការពារដោយគោលការណ៍ Row-Level Security យ៉ាងតឹងរ៉ឹង ដែលធានាថាមានតែបុគ្គលិក និងអ្នកគ្រប់គ្រងដែលមានសិទ្ធិប៉ុណ្ណោះដែលអាចអាន ឬកែប្រែទិន្នន័យបាន។\n• ការការពារពាក្យសម្ងាត់៖ ពាក្យសម្ងាត់ទាំងអស់ត្រូវបានបំប្លែងកូដសម្ងាត់យ៉ាងរឹងមាំដោយប្រើប្រាស់ក្បួន bcrypt មុនពេលរក្សាទុកក្នុងមូលដ្ឋានទិន្នន័យ។\n• ការបំប្លែងកូដពេលបញ្ជូន៖ រាល់ការបញ្ជូនទិន្នន័យរវាងទូរស័ព្ទ និងម៉ាស៊ីនបម្រើ ត្រូវបានការពារដោយពិធីសារសុវត្ថិភាពទំនើប TLS/HTTPS 1.3។\n• សុវត្ថិភាពក្នុងឧបករណ៍៖ ថូខិនផ្ទៀងផ្ទាត់ត្រូវបានរក្សាទុកយ៉ាងមានសុវត្ថិភាពក្នុង hardware-backed keychain នៃទូរស័ព្ទតាមរយៈ Expo SecureStore។",
    },
    {
      title: "5. ការបែងចែកទិន្នន័យតាមសាខា (Multi-System)",
      body: "កម្មវិធីគាំទ្រការគ្រប់គ្រងពហុប្រព័ន្ធ (ដូចជា system-0001, system-0002 និងសាខាក្រុមហ៊ុនផ្សេងៗទៀត)។ ព័ត៌មានបុគ្គលិក កំណត់ត្រាវត្តមាន និងសំណើច្បាប់ ត្រូវបានបែងចែកដាច់ដោយឡែកពីគ្នាទៅតាមសាខានីមួយៗ។",
    },
    {
      title: "6. សេវាកម្មតតិយភាគី",
      body: "កម្មវិធីនេះប្រើប្រាស់តែសេវាកម្មសហគ្រាសសំខាន់ៗដែលគួរឱ្យទុកចិត្តប៉ុណ្ណោះ៖\n\n• Supabase Inc.៖ សម្រាប់ការរក្សាទុកទិន្នន័យពពក ការផ្ទៀងផ្ទាត់គណនី និងការធ្វើសមកាលកម្មទិន្នន័យភ្លាមៗ។\n• Telegram API៖ សម្រាប់ផ្ញើសារជូនដំណឹងផ្ទៃក្នុងអំពីវត្តមាន និងសំណើច្បាប់ទៅកាន់ថ្នាក់ដឹកនាំក្រុមហ៊ុន។\n• ក្របខណ្ឌ Expo៖ សម្រាប់ការភ្ជាប់មុខងារប្រព័ន្ធទូរស័ព្ទ (កាមេរ៉ា, ទីតាំង, ការចែករំលែកឯកសារ)។\n\nកម្មវិធីនេះគ្មានការបង្កប់ផ្ទាំងពាណិជ្ជកម្ម (Ads) ឬឧបករណ៍តាមដានទិន្នន័យសម្រាប់ភាគីទីបីឡើយ។",
    },
    {
      title: "7. សិទ្ធិរបស់អ្នកប្រើប្រាស់ និងការលុបគណនី",
      body: "បុគ្គលិកមានសិទ្ធិពេញលេញលើទិន្នន័យផ្ទាល់ខ្លួនរបស់ពួកគេ៖\n\n• ការពិនិត្យ និងកែប្រែ៖ អ្នកអាចពិនិត្យ និងកែសម្រួលព័ត៌មានទំនាក់ទំនង ឬពាក្យសម្ងាត់នៅក្នុងកម្មវិធីបានគ្រប់ពេល។\n• ការស្នើសុំលុបគណនី៖ នៅពេលបញ្ចប់កិច្ចសន្យាការងារ បុគ្គលិកមានសិទ្ធិស្នើសុំលុបគណនី និងទិន្នន័យសម័យប្រជុំឧបករណ៍។ សូមទាក់ទងមកកាន់រដ្ឋបាលក្រុមហ៊ុន ឬផ្ញើអ៊ីមែលមកកាន់ support@sshgroups.com ដើម្បីស្នើសុំ។",
    },
    {
      title: "8. រយៈពេលនៃការរក្សាទុកទិន្នន័យ",
      body: "កំណត់ត្រាវត្តមាន និងសំណើផ្សេងៗត្រូវបានរក្សាទុកស្របតាមគោលការណ៍រដ្ឋបាលក្រុមហ៊ុន និងច្បាប់ការងារជាធរមាន។ នៅពេលគណនីត្រូវបានលុបជាផ្លូវការ ទិន្នន័យផ្ទាល់ខ្លួននឹងត្រូវលុប ឬបំប្លែងទៅជាអនាមិក។",
    },
    {
      title: "9. បច្ចុប្បន្នភាពគោលការណ៍ឯកជនភាព",
      body: "យើងអាចធ្វើបច្ចុប្បន្នភាពគោលការណ៍ឯកជនភាពនេះជាប្រចាំ ដើម្បីឆ្លើយតបទៅនឹងមុខងារថ្មីៗ ឬការផ្លាស់ប្តូរបទប្បញ្ញត្តិច្បាប់។ ការកែប្រែនឹងមានសុពលភាពភ្លាមៗនៅពេលត្រូវបានផ្សព្វផ្សាយនៅក្នុងកម្មវិធី។",
    },
    {
      title: "10. ព័ត៌មានទំនាក់ទំនង",
      body: "ក្រុមហ៊ុន SSH Group Co., Ltd.\nអាសយដ្ឋាន៖ រាជធានីភ្នំពេញ, ព្រះរាជាណាចក្រកម្ពុជា\nអ៊ីមែល៖ support@sshgroups.com\nគេហទំព័រ៖ www.sshgroups.com\n\nប្រសិនបើលោកអ្នកមានសំណួរ ឬចម្ងល់ទាក់ទងនឹងគោលការណ៍ឯកជនភាពនេះ សូមទាក់ទងមកកាន់យើងខ្ញុំដោយផ្ទាល់។",
    },
  ],
};
