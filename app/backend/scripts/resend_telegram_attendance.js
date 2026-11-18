const token = "8911068365:AAEyHW4A2kWmTCAZgal606ArSsuVwArGEvE";
const chatId = "-1004319410551";

const recordsToSend = [
  {
    staff_id: "0017",
    name: "Ms. YOU Kompheak",
    date: "2026-11-18",
    time: "8:07:33 AM",
    type: "time-in",
    raw_time: "8:07:33 AM",
  },
  {
    staff_id: "0021",
    name: "Mr. EANG Sambath",
    date: "2026-11-18",
    time: "8:08:47 AM",
    type: "time-in",
    raw_time: "8:08:47 AM",
  },
  {
    staff_id: "0016",
    name: "Ms. NEP Sreypov",
    date: "2026-11-18",
    time: "8:09:29 AM",
    type: "time-in",
    raw_time: "8:09:29 AM",
  },
  {
    staff_id: "0007",
    name: "Mr. BUN Sokkoeu",
    date: "2026-11-18",
    time: "8:09:43 AM",
    type: "time-in",
    raw_time: "8:09:43 AM",
  },
  {
    staff_id: "0024",
    name: "Mr. HORN Menghor",
    date: "2026-11-18",
    time: "8:09:44 AM",
    type: "time-in",
    raw_time: "8:09:44 AM",
  },
  {
    staff_id: "0019",
    name: "Ms. PHOS Sreynit",
    date: "2026-11-18",
    time: "8:12:53 AM",
    type: "time-in",
    raw_time: "8:12:53 AM",
  },
  {
    staff_id: "0020",
    name: "Mr. HON Panha",
    date: "2026-11-18",
    time: "8:12:53 AM",
    type: "time-in",
    raw_time: "8:12:53 AM",
  },
  {
    staff_id: "0015",
    name: "Mr. Sot Haopheng",
    date: "2026-11-18",
    time: "8:13:14 AM",
    type: "time-in",
    raw_time: "8:13:14 AM",
  },
];

function buildTelegramMessage(record) {
  const typeEmoji =
    record.type === "time-in" || record.type === "TIME_IN"
      ? "🟢 [TIME-IN]"
      : record.type === "time-out" || record.type === "TIME_OUT"
        ? "🔴 [TIME-OUT]"
        : "🟣 [TIME-OTHER]";

  const cleanTime = (record.time || "")
    .replace(/[\u202F\u00A0]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return [
    `🔔 <b>Attendance Scan Alert</b>`,
    `🆔 <b>Staff ID:</b> ${record.staff_id}`,
    `👤 <b>Staff:</b> ${record.name}`,
    `🚦 <b>Status:</b> ${typeEmoji}`,
    `📅 <b>Date:</b> ${record.date}`,
    `⏰ <b>Time:</b> ${cleanTime}`,
  ].join("\n");
}

async function sendAll() {
  console.log(
    `Starting to send ${recordsToSend.length} attendance alerts to Telegram chat ${chatId}...`,
  );

  for (let i = 0; i < recordsToSend.length; i++) {
    const rec = recordsToSend[i];
    const text = buildTelegramMessage(rec);

    console.log(
      `\n[${i + 1}/${recordsToSend.length}] Sending alert for Staff ${rec.staff_id} (${rec.name}) at ${rec.time}...`,
    );

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "HTML",
        }),
      },
    );

    const data = await response.json();
    if (data.ok) {
      console.log(
        `✅ Successfully sent message ID ${data.result.message_id} to Telegram!`,
      );
    } else {
      console.error(`❌ Failed to send for Staff ${rec.staff_id}:`, data);
    }

    // Delay 300ms between messages to avoid hitting Telegram rate limits
    await new Promise((r) => setTimeout(r, 350));
  }

  console.log(
    "\n🎉 Finished sending all missing attendance alerts to Telegram.",
  );
}

sendAll().catch(console.error);
