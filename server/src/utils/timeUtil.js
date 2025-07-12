const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const normalizeTime = (str) => {
  console.log(">> normalizeTime nhận:", str);
  const d = dayjs(str, ["HH:mm:ss", "HH:mm", "H:mm", "H:mm:ss"], true); // strict
  if (!d.isValid()) throw new Error("Định dạng thời gian không hợp lệ!");
  return d.format("HH:mm:ss");
};
module.exports = {
  normalizeTime,
};
