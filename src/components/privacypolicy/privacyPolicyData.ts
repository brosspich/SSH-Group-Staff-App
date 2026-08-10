export interface PolicySection {
  title: string;
  body: string;
}

export type PolicyLang = "en" | "zh" | "km";

export const PRIVACY_POLICY_DATA: Record<PolicyLang, PolicySection[]> = {
  en: [
    {
      title: "1. Developer & Introduction",
      body: "The SSH Group Staff App (package: com.sshgroups.staffapp) is developed by BROSSPICH and operated by SSH Group Co., Ltd. This Privacy Policy explains how we collect, store, process, and safeguard the information you provide when using our Staff management mobile application.",
    },
    {
      title: "2. Information We Collect",
      body: "To provide a complete Staff management experience, we collect:\n• Account & Profile Information: Staff ID, user credentials, full name, username, position, role, email address, phone number, and profile picture.\n• Camera & Scanner Access: Camera permissions are used to scan QR codes for staff attendance check-in, device authorization, and barcode operations. No camera data is recorded or stored without your interaction.\n• Device & Active Session Data: Device model, operating system version, active device session logs via Expo Device, authentication tokens, and session metadata.\n• Storage & Local Security: Access to local storage via Expo SecureStore and AsyncStorage to securely maintain login state, user preferences, offline cache, and exported documents.\n• Location Data (If Enabled): Coarse or fine location access (where applicable) used exclusively to verify staff presence during attendance check-in. We do not track or sell your real-time background location.",
    },
    {
      title: "3. How We Use Your Information",
      body: "We process your information solely to:\n• Authenticate staff logins, verify account active status, and enforce role-based access controls.\n• Record staff attendance, manage active device sessions, and prevent unauthorized account sharing.\n• Synchronize account data securely with our cloud database backend.\n• Maintain application stability, monitor performance, and enhance security protocols.\n\nWe do not sell, rent, or share your personal or account data with third-party marketers.",
    },
    {
      title: "4. Data Storage, Security & Cloud Backend",
      body: "• Cloud Hosting: The app uses Supabase (a secure cloud database backend) to store and back up staff data tables and attendance logs.\n• Row-Level Security (RLS): We enforce strict Row-Level Security policies on Supabase, ensuring that only authorized users from SSH Group Co., Ltd. can access organization data.\n• Transport & Rest Encryption: All data transmitted between the app and Supabase is encrypted using secure HTTPS/TLS protocols. Server data is encrypted at rest.\n• Secure Device Storage: Access tokens and sensitive auth credentials are kept locally on your mobile device using hardware-backed Expo SecureStore.",
    },
    {
      title: "5. Your Rights & Account Deletion",
      body: "You maintain full control over your account data:\n• Access & Correction: You can review and update your profile details directly in the application.\n• Account Deletion Request: You have the right to request deletion of your account and associated staff data. To submit an account deletion request, please email support@sshgroups.com. Upon verification, your user record and session data will be permanently removed.",
    },
    {
      title: "6. Third-Party Services",
      body: "The application integrates with Supabase for cloud backend storage. We do not share your data with third-party advertising networks, analytics brokers, or tracking agencies.",
    },
    {
      title: "7. Policy Updates",
      body: "We may update this Privacy Policy from time to time to reflect changes in our app features or regulatory requirements. The latest version will be effective immediately upon posting in the app.",
    },
    {
      title: "8. Contact Us",
      body: "SSH Group Co., Ltd.\nAddress: Phnom Penh, Cambodia\nEmail: support@sshgroups.com\nWebsite: www.sshgroups.com\n\nFor any questions or concerns regarding this policy, please contact us directly.",
    },
  ],
  zh: [
    {
      title: "1. 开发者与引言",
      body: "SSH Group Staff 应用程序（包名：com.sshgroups.staffapp）由 BROSSPICH 开发，并由 SSH Group Co., Ltd. 运营。本隐私政策解释了您在使用我们的员工管理移动应用程序时，我们如何收集、存储、处理和保护您提供的信息。",
    },
    {
      title: "2. 我们收集的信息",
      body: "为了提供完整的员工管理体验，我们收集：\n• 账户与个人资料信息：员工编号、用户凭据、姓名、用户名、职位、角色、电子邮件地址、电话号码及头像照片。\n• 摄像头与扫码功能：摄像头权限用于扫描二维码进行员工考勤打卡、设备授权及条码识别。未经您的交互，不会录制或存储任何摄像头数据。\n• 设备与活动会话数据：设备型号、操作系统版本、通过 Expo Device 获取的活动设备会话日志、身份验证令牌及会话元数据。\n• 本地存储与安全：通过 Expo SecureStore 和 AsyncStorage 访问设备存储，以安全维护登录状态、用户偏好、离线缓存和导出的文档。\n• 位置信息（如适用）：粗略或精确位置权限（如启用）仅用于在考勤打卡时验证员工现场打卡，我们绝不会跟踪或出售您的实时后台位置。",
    },
    {
      title: "3. 信息使用方式",
      body: "我们处理您的信息仅用于：\n• 验证员工登录、确认账户激活状态并执行基于角色的权限控制。\n• 记录员工考勤、管理活动设备会话并防止未经授权的账户共享。\n• 与我们的云数据库后端安全同步数据。\n• 维护应用程序稳定性、监控性能并增强安全协议。\n\n我们不会向第三方营销人员出售、出租或共享您的个人或账户数据。",
    },
    {
      title: "4. 数据存储、安全与云服务商",
      body: "• 云托管：应用程序使用 Supabase（安全的云数据库后端）存储和备份员工数据表及考勤记录。\n• 行级安全（RLS）：我们在 Supabase 上实施严格的行级安全策略，确保只有来自 SSH Group Co., Ltd. 的授权员工才能访问内部数据。\n• 传输与静态加密：应用程序与 Supabase 之间传输的所有数据均使用安全的 HTTPS/TLS 协议加密，服务器上的数据同样经过静态加密保护。\n• 设备安全存储：访问令牌和敏感身份验证凭据通过 Expo SecureStore 安全保存在您的移动设备本地。",
    },
    {
      title: "5. 您的权利与账户删除",
      body: "您保留对账户数据的完整控制权：\n• 访问与更正：您可以在应用中查看并更新您的个人资料详情。\n• 账户删除申请：您有权申请删除您的账户及相关员工数据。如需提交账户删除申请，请发送电子邮件至 support@sshgroups.com。经验证后，您的用户记录和会话数据将被永久删除。",
    },
    {
      title: "6. 第三方服务",
      body: "应用程序集成了 Supabase 用于云后端存储服务。我们不会与第三方广告网络、数据分析代理或跟踪机构共享您的数据。",
    },
    {
      title: "7. 政策更新",
      body: "我们可能会不时更新本隐私政策，以反映应用功能或监管要求的变化。最新版本在应用内发布后立即生效。",
    },
    {
      title: "8. 联系我们",
      body: "SSH Group Co., Ltd.\n地址：柬埔寨金边\n电子邮件：support@sshgroups.com\n网站：www.sshgroups.com\n\n如有关于本政策的疑问或关注事项，请直接与我们联系。",
    },
  ],
  km: [
    {
      title: "1. អ្នកអភិវឌ្ឍន៍ និងការណែនាំ",
      body: "កម្មវិធី SSH Group Staff App (កញ្ចប់កម្មវិធី៖ com.sshgroups.staffapp) ត្រូវបានអភិវឌ្ឍដោយ BROSSPICH និងដំណើរការដោយក្រុមហ៊ុន SSH Group Co., Ltd ។ គោលការណ៍ឯកជនភាពនេះ ពន្យល់ពីរបៀបដែលយើងប្រមូល រក្សាទុក ដំណើរការ និងការពារព័ត៌មានដែលអ្នកផ្តល់ឱ្យនៅពេលប្រើប្រាស់កម្មវិធីទូរស័ព្ទគ្រប់គ្រងបុគ្គលិករបស់យើង។",
    },
    {
      title: "2. ព័ត៌មានដែលយើងប្រមូល",
      body: "ដើម្បីផ្តល់នូវបទពិសោធន៍គ្រប់គ្រងបុគ្គលិកដែលមានដំណើរការពេញលេញ យើងប្រមូល៖\n• ព័ត៌មានគណនី និងប្រវត្តិរូប៖ អត្តលេខបុគ្គលិក ព័ត៌មានសម្ងាត់អ្នកប្រើប្រាស់ ឈ្មោះពេញ ឈ្មោះអ្នកប្រើប្រាស់ តួនាទី អាសយដ្ឋានអ៊ីមែល លេខទូរស័ព្ទ និងរូបថតប្រវត្តិរូប។\n• កាមេរ៉ា និងការស្កែន៖ ការអនុញ្ញាតប្រើប្រាស់កាមេរ៉ា ត្រូវប្រើសម្រាប់ស្កែន QR Code កត់ត្រាវត្តមានបុគ្គលិក ការអនុញ្ញាតឧបករណ៍ និងការស្កែនបារកូដ។ គ្មានទិន្នន័យកាមេរ៉ាណាមួយត្រូវបានថត ឬរក្សាទុកដោយគ្មានអន្តរកម្មរបស់អ្នកប្រើប្រាស់នោះទេ។\n• ទិន្នន័យឧបករណ៍ និងសម័យប្រជុំ៖ ម៉ូឌែលឧបករណ៍ កំណែប្រព័ន្ធប្រតិបត្តិការ កំណត់ត្រាសម័យប្រជុំឧបករណ៍តាមរយៈ Expo Device និងថូខិនផ្ទៀងផ្ទាត់។\n• ការរក្សាទុក និងសុវត្ថិភាពក្នុងឧបករណ៍៖ ការចូលប្រើការរក្សាទុកក្នុងឧបករណ៍តាមរយៈ Expo SecureStore និង AsyncStorage គឺដើម្បីរក្សាសុវត្ថិភាពស្ថានភាពចូល ឯកសារ និងទិន្នន័យកម្មវិធី។\n• ព័ត៌មានទីតាំង (ប្រសិនបើមាន)៖ ការអនុញ្ញាតទីតាំង (ប្រសិនបើបើក) ត្រូវបានប្រើប្រាស់ទាំងស្រុងដើម្បីផ្ទៀងផ្ទាត់វត្តមានបុគ្គលិកនៅពេលធ្វើការកត់ត្រាវត្តមាន (Check-in)។ យើងមិនតាមដាន ឬលក់ទីតាំងរបស់អ្នកឡើយ។",
    },
    {
      title: "3. របៀបដែលយើងប្រើប្រាស់ព័ត៌មានរបស់អ្នក",
      body: "យើងដំណើរការព័ត៌មានរបស់អ្នកសម្រាប់តែ៖\n• ផ្ទៀងផ្ទាត់ការចូលប្រើប្រាស់ គ្រប់គ្រងតួនាទីបុគ្គលិក និងកំណត់សិទ្ធិប្រើប្រាស់។\n• កត់ត្រាវត្តមានបុគ្គលិក គ្រប់គ្រងសម័យប្រជុំឧបករណ៍ និងការពារការប្រើប្រាស់គណនីដោយគ្មានការអនុញ្ញាត។\n• ធ្វើការសមកាលកម្មទិន្នន័យដោយសុវត្ថិភាពជាមួយ cloud database របស់យើង។\n• រក្សាស្ថិរភាពកម្មវិធី ត្រួតពិនិត្យដំណើរការ និងបង្កើនសុវត្ថិភាព។\n\nយើងមិនលក់ ជួល ឬចែករំលែកទិន្នន័យរបស់អ្នកជាមួយភាគីទីបីឡើយ។",
    },
    {
      title: "4. ការរក្សាទុក សុវត្ថិភាពទិន្នន័យ និងអ្នកផ្តល់សេវាកម្មពពក",
      body: "• ការរក្សាទុកនៅលើពពក៖ កម្មវិធីនេះប្រើប្រាស់ Supabase (Cloud backend មានសុវត្ថិភាព) សម្រាប់ការរក្សាទុកទិន្នន័យ និងកំណត់ត្រាវត្តមាន។\n• សុវត្ថិភាពកម្រិតជួរ (RLS)៖ យើងអនុវត្តគោលការណ៍ Row-Level Security យ៉ាងតឹងរ៉ឹងនៅលើ Supabase ដើម្បីធានាថាមានតែបុគ្គលិកដែលមានសិទ្ធិប៉ុណ្ណោះដែលអាចចូលប្រើទិន្នន័យបាន។\n• ការបំប្លែងកូដសម្ងាត់ (Encryption)៖ ទិន្នន័យត្រូវបានបំប្លែងកូដសម្ងាត់ដោយប្រើប្រាស់ពិធីសារ HTTPS/TLS សុវត្ថិភាព។\n• សុវត្ថិភាពឧបករណ៍៖ ព័ត៌មានសម្ងាត់គណនី និងកូនសោសុវត្ថិភាព ត្រូវបានរក្សាទុកនៅលើឧបករណ៍ទូរស័ព្ទដៃរបស់អ្នកដោយផ្ទាល់ ដោយប្រើប្រាស់ Expo SecureStore។",
    },
    {
      title: "5. សិទ្ធិរបស់អ្នក និងការលុបគណនី",
      body: "អ្នករក្សានូវការគ្រប់គ្រងពេញលេញលើទិន្នន័យរបស់អ្នក៖\n• ការចូលប្រើ និងការកែតម្រូវ៖ អ្នកអាចពិនិត្យមើល និងធ្វើបច្ចុប្បន្នភាពព័ត៌មានគណនីនៅក្នុងកម្មវិធី។\n• ការលុបគណនី៖ អ្នកមានសិទ្ធិស្នើសុំលុបគណនីរបស់អ្នក។ ដើម្បីស្នើសុំលុបគណនី សូមផ្ញើអ៊ីមែលមកកាន់ support@sshgroups.com។ បន្ទាប់ពីផ្ទៀងផ្ទាត់រួច ទិន្នន័យរបស់អ្នកនឹងត្រូវលុបជាអចិន្ត្រៃយ៍។",
    },
    {
      title: "6. ការរួមបញ្ចូលជាមួយតតិយភាគី",
      body: "កម្មវិធីនេះរួមបញ្ចូលគ្នាជាមួយ Supabase សម្រាប់ការរក្សាទុកទិន្នន័យ cloud backend។ យើងមិនចែករំលែកទិន្នន័យជាមួយបណ្តាញផ្សាយពាណិជ្ជកម្មភាគីទីបីឡើយ។",
    },
    {
      title: "7. បច្ចុប្បន្នភាពគោលការណ៍",
      body: "យើងអាចធ្វើបច្ចុប្បន្នភាពគោលការណ៍ឯកជនភាពនេះពីមួយពេលទៅមួយពេល ដើម្បីឆ្លុះបញ្ចាំងពីការផ្លាស់ប្តូរមុខងារកម្មវិធី ឬតម្រូវការច្បាប់។",
    },
    {
      title: "8. ទាក់ទងមកយើងខ្ញុំ",
      body: "ក្រុមហ៊ុន SSH Group Co., Ltd.\nអាសយដ្ឋាន៖ ភ្នំពេញ, ប្រទេសកម្ពុជា\nអ៊ីមែល៖ support@sshgroups.com\nគេហទំព័រ៖ www.sshgroups.com\n\nសម្រាប់សំណួរ ឬកង្វល់ផ្សេងៗអំពីគោលការណ៍នេះ សូមទាក់ទងមកយើងខ្ញុំដោយផ្ទាល់។",
    },
  ],
};
