const { rawSql } = require("./raw_users_input.js");

function parseTuples(sql) {
  const insertIdx = sql.indexOf("VALUES");
  const valuesPart = sql.slice(insertIdx + 6).trim();
  const results = [];

  let i = 0;
  while (i < valuesPart.length) {
    while (i < valuesPart.length && valuesPart[i] !== "(") i++;
    if (i >= valuesPart.length) break;
    i++; // skip '('

    const row = [];
    let cur = "";
    let inString = false;

    while (i < valuesPart.length) {
      const c = valuesPart[i];
      if (inString) {
        if (c === "'") {
          if (valuesPart[i + 1] === "'") {
            cur += "'";
            i += 2;
            continue;
          } else {
            inString = false;
            i++;
            continue;
          }
        } else {
          cur += c;
          i++;
        }
      } else {
        if (c === "'") {
          inString = true;
          i++;
        } else if (c === ",") {
          row.push(cur.trim() === "null" ? null : cur.trim());
          cur = "";
          i++;
        } else if (c === ")") {
          row.push(cur.trim() === "null" ? null : cur.trim());
          results.push(row);
          i++;
          break;
        } else {
          cur += c;
          i++;
        }
      }
    }
  }
  return results;
}

const rows = parseTuples(rawSql);
console.log("Parsed rows:", rows.length);
for (const r of rows) {
  const id = r[0];
  const name = r[1];
  const sysId = r[12];
  let attList = [];
  try {
    if (r[10]) attList = JSON.parse(r[10]);
  } catch (e) {
    console.log("Error parsing att for", id, e.message);
  }
  const novRecords = attList.filter(
    (a) => a.date && a.date.startsWith("2026-11"),
  );
  console.log(
    `User: ${id} (${name}) | System: ${sysId} | Total Att: ${attList.length} | Nov Att: ${novRecords.length}`,
  );
}
