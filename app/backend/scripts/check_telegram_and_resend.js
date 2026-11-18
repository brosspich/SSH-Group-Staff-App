const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");

const d1 = new CloudflareD1Client();

async function checkCompany() {
  const comp = await d1.query(
    "SELECT id, name, telegramBotToken, telegramChatId FROM Company WHERE id = 'system-0001';",
  );
  console.log("Company:", JSON.stringify(comp, null, 2));
}

checkCompany().catch(console.error);
