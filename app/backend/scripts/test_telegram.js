const token = "8911068365:AAEyHW4A2kWmTCAZgal606ArSsuVwArGEvE";
const chatId = "-1004319410551";

async function check() {
  const me = await fetch(`https://api.telegram.org/bot${token}/getMe`).then(
    (r) => r.json(),
  );
  console.log("Bot:", me);

  const chat = await fetch(
    `https://api.telegram.org/bot${token}/getChat?chat_id=${chatId}`,
  ).then((r) => r.json());
  console.log("Chat:", chat);
}

check().catch(console.error);
