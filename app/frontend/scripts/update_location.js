async function run() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.234:4000";
  console.log("Updating location via Backend API:", apiUrl);
  const updatedLocation = [
    "https://www.google.com/maps?q=11.502767,104.851553",
    "https://maps.app.goo.gl/MmFnRaN1ueSwSk48A",
    "11.502767, 104.851553",
  ];
  try {
    const res = await fetch(`${apiUrl}/company-query/system-0001`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: updatedLocation,
        company_name: "SSH Group",
      }),
    });
    console.log("Status:", res.status);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
