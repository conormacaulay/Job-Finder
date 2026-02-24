const https = require("https");

exports.handler = async function (event) {
  const params = event.queryStringParameters || {};
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key not configured on server." }) };
  }

  const searchParams = new URLSearchParams();
  const allowed = ["query", "page", "num_pages", "date_posted", "employment_types", "remote_jobs_only"];
  allowed.forEach((k) => { if (params[k]) searchParams.append(k, params[k]); });

  const options = {
    hostname: "jsearch.p.rapidapi.com",
    path: `/search?${searchParams.toString()}`,
    method: "GET",
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: data,
        });
      });
    });

    req.on("error", (err) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: err.message }),
      });
    });

    req.end();
  });
};
