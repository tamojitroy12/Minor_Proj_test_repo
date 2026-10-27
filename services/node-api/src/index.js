const app = require("./app");
const { initTelemetry } = require("./telemetry");

const port = process.env.PORT || 3000;

initTelemetry();

app.listen(port, () => {
  console.log(`node-api listening on ${port}`);
});
