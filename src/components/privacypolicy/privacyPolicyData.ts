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
      body: "To provide a fully functional Staff management experience, we collect:\n• Account Information: User credentials, full name, username, position, role, email address, and phone number.\n• Device & Session Data: Device identifiers, operating system version, active device session logs, and authentication tokens.\n• Location Information: scanning nearby devices or local services requires coarse/fine location permissions where applicable. We only use this permission to discover and connect to local services and do not track your geographic location.\n• Media & Storage: Access to local storage is required to save local app data, exports, and document downloads.\n• Audio Data: Microphone access (if enabled) is used exclusively for speech-to-text searching or voice notes, and no audio is recorded or uploaded without user interaction.",
    },
    {
      title: "3. How We Use Your Information",
      body: "We process your information solely to:\n• Authenticate user logins, manage staff roles, and verify account active status.\n• Display staff account information, position details, and user permissions.\n• Synchronize account data securely with our cloud database.\n• Maintain application stability, monitor performance, and enhance security.\n\nWe do not sell, rent, or share your personal or account data with third-party marketers.",
    },
    {
      title: "4. Data Storage, Security & Cloud Provider",
      body: "• Cloud Hosting: The app uses Supabase (a secure cloud backend provider) to sync and back up staff database tables.\n• Row-Level Security (RLS): We enforce strict Row-Level Security policies on Supabase. This ensures that only authorized users and staff from your organization can access internal system data.\n• Encryption: Data transmitted between the app and Supabase is encrypted using secure HTTPS/SSL layers. Data is also secured through encryption at rest on cloud servers.\n• Device Security: Access credentials and secure keys are kept locally on your mobile device utilizing Expo SecureStore.",
    },
    {
      title: "5. Your Rights & Account Deletion",
      body: "You maintain control over your account data:\n• Access & Rectification: You can review and update account profile details in the app.\n• Account Deletion: You have the right to request deletion of your account and associated staff data. To request account deletion, please email support@sshgroups.com. Upon verification, your user record will be permanently deleted from the database.",
    },
    {
      title: "6. Third-Party Integrations",
      body: "The app integrates with Supabase for cloud backend storage. We do not share data with third-party advertising networks.",
    },
    {
      title: "7. Policy Updates",
      body: "We may update this Privacy Policy from time to time. The latest update will be effective immediately upon posting, and continued usage of the application indicates consent to the modified terms.",
    },
    {
      title: "8. Contact Us",
      body: "SSH Group Co., Ltd.\nAddress: Phnom Penh, Cambodia\nEmail: support@sshgroups.com\nWebsite: www.sshgroups.com\n\nFor questions or concerns regarding this policy, please contact us directly.",
    },
  ],
  zh: [
    {
      title: "1. 开发者与引言",
      body: "SSH Group Staff 应用程序（包名：com.sshgroups.staffapp）由 BROSSPICH 开发，并由 SSH Group Co., Ltd. 运营。本隐私政策解释了您在使用我们的员工管理移动应用程序时，我们如何收集、存储、处理和保护您提供的信息。",
    },
    {
      title: "2. 我们收集的信息",
      body: "为了提供功能齐全的员工管理体验，我们收集：\n• 账户信息：用户凭据、姓名、用户名、职位、角色、电子邮件地址和电话号码。\n• 设备与会话数据：设备标识符、操作系统版本、活动设备会话日志和身份验证令牌。\n• 位置信息：扫描附近的设备或本地服务需要位置权限（粗略/精确位置）。我们仅使用此权限建立本地连接，不会跟踪或存储您的地理位置。\n• 媒体与存储：保存本地应用数据、导出和文档下载需要访问本地存储。\n• 音频数据：麦克风访问（如果启用）仅用于语音转文本搜索或语音备忘录等功能，未经用户交互不会录制或上传任何音频。",
    },
    {
      title: "3. 信息使用方式",
      body: "我们处理您的信息仅用于：\n• 验证用户登录、管理员工角色并确认账户激活状态。\n• 显示员工账户信息、职位详情和用户权限。\n• 与我们的云数据库安全同步数据。\n• 维护应用程序稳定性、监控性能并增强安全性。\n\n我们不会向第三方营销人员出售、出租或共享您的个人或账户数据。",
    },
    {
      title: "4. 数据存储、安全与云服务商",
      body: "• 云托管：应用程序使用 Supabase（一个安全的云后端提供商）来同步和备份员工数据库表。\n• 行级安全（RLS）：我们在 Supabase 上实施严格的行级安全策略。这确保了只有来自您组织的授权用户和员工才能访问内部系统数据。\n• 加密：应用程序与 Supabase 之间传输的数据使用安全的 HTTPS/SSL 层进行加密。云服务器上的静态数据也通过加密进行保护。\n• 设备安全：访问凭据和安全密钥保存在您本地的移动设备中（利用 Expo SecureStore）。",
    },
    {
      title: "5. 您的权利与账户删除",
      body: "您保留对账户数据的控制权：\n• 访问与更正：您可以在应用中查看并更新账户资料详情。\n• 账户删除：您有权申请删除您的账户及相关员工数据。如需申请删除账户，请发送电子邮件至 support@sshgroups.com。经验证后，您的用户记录将从数据库中永久删除。",
    },
    {
      title: "6. 第三方集成",
      body: "应用程序集成了 Supabase 用于云后端存储。我们不会与第三方广告网络共享数据。",
    },
    {
      title: "7. 政策更新",
      body: "我们可能会不时更新本隐私政策。任何修改在发布后立即生效，继续使用应用程序表示同意修改后的条款。",
    },
    {
      title: "8. 联系我们",
      body: "SSH Group Co., Ltd.\n地址：柬埔寨金边\n电子邮件：support@sshgroups.com\n网站：www.sshgroups.com\n\n如有关于本政策的疑问，请直接联系我们。",
    },
  ],
  km: [
    {
      title: "1. អ្នកអភិវឌ្ឍន៍ និងការណែនាំ",
      body: "កម្មវិធី SSH Group Staff App (កញ្ចប់កម្មវិធី៖ com.sshgroups.staffapp) ត្រូវបានអភិវឌ្ឍដោយ BROSSPICH និងដំណើរការដោយក្រុមហ៊ុន SSH Group Co., Ltd ។ គោលការណ៍ឯកជនភាពនេះ ពន្យល់ពីរបៀបដែលយើងប្រមូល រក្សាទុក ដំណើរការ និងការពារព័ត៌មានដែលអ្នកផ្តល់ឱ្យនៅពេលប្រើប្រាស់កម្មវិធីទូរស័ព្ទគ្រប់គ្រងបុគ្គលិករបស់យើង។",
    },
    {
      title: "2. ព័ត៌មានដែលយើងប្រមូល",
      body: "ដើម្បីផ្តល់នូវបទពិសោធន៍គ្រប់គ្រងបុគ្គលិកដែលមានដំណើរការពេញលេញ យើងប្រមូល៖\n• ព័ត៌មានគណនី៖ ព័ត៌មានសម្ងាត់អ្នកប្រើប្រាស់ ឈ្មោះពេញ ឈ្មោះអ្នកប្រើប្រាស់ តួនាទី អាសយដ្ឋានអ៊ីមែល និងលេខទូរស័ព្ទ។\n• ទិន្នន័យឧបករណ៍ និងសម័យប្រជុំ៖ លេខសម្គាល់ឧបករណ៍ កំណែប្រព័ន្ធប្រតិបត្តិការ និងកំណត់ត្រាឧបករណ៍។\n• ព័ត៌មានទីតាំង៖ ការស្កែនរកឧបករណ៍ ឬសេវាកម្មក្នុងតំបន់នៅក្បែរនោះ តម្រូវឱ្យមានការអនុញ្ញាតទីតាំង។ យើងប្រើការអនុញ្ញាតនេះដើម្បីស្វែងរក និងភ្ជាប់តែប៉ុណ្ណោះ ហើយមិនតាមដានទីតាំងភូមិសាស្ត្ររបស់អ្នកឡើយ។\n• ប្រព័ន្ធផ្សព្វផ្សាយ និងការរក្សាទុក៖ ការចូលប្រើការរក្សាទុកក្នុងឧបករណ៍គឺតម្រូវឱ្យរក្សាទុកទិន្នន័យ និងឯកសារ។\n• ទិន្នន័យសំឡេង៖ ការចូលប្រើមីក្រូហ្វូន (ប្រសិនបើបើក) ត្រូវបានប្រើប្រាស់ទាំងស្រុងសម្រាប់មុខងារស្វែងរកដោយសំឡេង ហើយគ្មានសំឡេងណាមួយត្រូវបានថត ឬបង្ហោះឡើងដោយគ្មានអន្តរកម្មរបស់អ្នកប្រើប្រាស់នោះទេ។",
    },
    {
      title: "3. របៀបដែលយើងប្រើប្រាស់ព័ត៌មានរបស់អ្នក",
      body: "យើងដំណើរការព័ត៌មានរបស់អ្នកសម្រាប់តែ៖\n• ផ្ទៀងផ្ទាត់ការចូលរបស់អ្នកប្រើប្រាស់ គ្រប់គ្រងតួនាទីបុគ្គលិក និងស្ថានភាពគណនី។\n• បង្ហាញព័ត៌មានគណនីបុគ្គលិក និងសិទ្ធិប្រើប្រាស់។\n• ធ្វើការសមកាលកម្មទិន្នន័យដោយសុវត្ថិភាពជាមួយមូលដ្ឋានទិន្នន័យពពករបស់យើង។\n• រក្សាស្ថិរភាពកម្មវិធី ត្រួតពិនិត្យដំណើរការ និងបង្កើនសុវត្ថិភាព។\n\nយើងមិនលក់ ជួល ឬចែករំលែកទិន្នន័យរបស់អ្នកជាមួយភាគីទីបីឡើយ។",
    },
    {
      title: "4. ការរក្សាទុក សុវត្ថិភាពទិន្នន័យ និងអ្នកផ្តល់សេវាកម្មពពក",
      body: "• ការរក្សាទុកនៅលើពពក៖ កម្មវិធីនេះប្រើប្រាស់ Supabase សម្រាប់ការរក្សាទុកទិន្នន័យ។\n• សុវត្ថិភាពកម្រិតជួរ (RLS)៖ យើងអនុវត្តគោលការណ៍សុវត្ថិភាពកម្រិតជួរយ៉ាងតឹងរ៉ឹងនៅលើ Supabase។\n• ការបំប្លែងកូដសម្ងាត់៖ ទិន្នន័យត្រូវបានបំប្លែងកូដសម្ងាត់ដោយប្រើស្រទាប់ HTTPS/SSL សុវត្ថិភាព។\n• សុវត្ថិភាពឧបករណ៍៖ ព័ត៌មានសម្ងាត់គណនី និងកូនសោសុវត្ថិភាព ត្រូវបានរក្សាទុកនៅលើឧបករណ៍ទូរស័ព្ទដៃរបស់អ្នកដោយផ្ទាល់ ដោយប្រើប្រាស់ Expo SecureStore។",
    },
    {
      title: "5. សិទ្ធិរបស់អ្នក និងការលុបគណនី",
      body: "អ្នករក្សានូវការគ្រប់គ្រងពេញលេញលើទិន្នន័យរបស់អ្នក៖\n• ការចូលប្រើ និងការកែតម្រូវ៖ អ្នកអាចពិនិត្យមើល និងធ្វើបច្ចុប្បន្នភាពព័ត៌មានគណនីនៅក្នុងកម្មវិធី។\n• ការលុបគណនី៖ អ្នកមានសិទ្ធិស្នើសុំលុបគណនីរបស់អ្នក។ ដើម្បីស្នើសុំលុបគណនី សូមផ្ញើអ៊ីមែលមកកាន់ support@sshgroups.com។",
    },
    {
      title: "6. ការរួមបញ្ចូលជាមួយតតិយភាគី",
      body: "កម្មវិធីនេះរួមបញ្ចូលគ្នាជាមួយ Supabase សម្រាប់ការរក្សាទុកទិន្នន័យ cloud backend។ យើងមិនចែករំលែកទិន្នន័យជាមួយបណ្តាញផ្សាយពាណិជ្ជកម្មភាគីទីបីឡើយ។",
    },
    {
      title: "7. បច្ចុប្បន្នភាពគោលការណ៍",
      body: "យើងអាចធ្វើបច្ចុប្បន្នភាពគោលការណ៍ឯកជនភាពនេះពីមួយពេលទៅមួយពេល។",
    },
    {
      title: "8. ទាក់ទងមកយើងខ្ញុំ",
      body: "ក្រុមហ៊ុន SSH Group Co., Ltd.\nអាសយដ្ឋាន៖ ភ្នំពេញ, ប្រទេសកម្ពុជា\nអ៊ីមែល៖ support@sshgroups.com\nគេហទំព័រ៖ www.sshgroups.com\n\nសម្រាប់សំណួរ ឬកង្វល់ផ្សេងៗអំពីគោលការណ៍នេះ សូមទាក់ទងមកយើងខ្ញុំដោយផ្ទាល់។",
    },
  ],
};
