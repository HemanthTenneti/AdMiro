/**
 * Custom request/response logging middleware
 */

const logRequest = (req, res, next) => {
  const startTime = Date.now();
  const { method, path, query, body, headers } = req;

  // Log incoming request
  console.log(`\n${"=".repeat(80)}`);
  console.log(`📨 [${new Date().toISOString()}] ${method} ${path}`);
  console.log(`${"─".repeat(80)}`);

  if (Object.keys(query).length > 0) {
    console.log(`Query:`, query);
  }

  if (body && Object.keys(body).length > 0) {
    // Don't log sensitive fields
    const safebody = { ...body };
    if (safebody.password) safebody.password = "***";
    if (safebody.refreshToken) safebody.refreshToken = "***";
    console.log(`Body:`, safebody);
  }

  const authHeader = headers.authorization;
  if (authHeader) {
    console.log(
      `Authorization: Bearer ${authHeader.substring(7).substring(0, 20)}...`
    );
  }

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const statusColor =
      statusCode >= 400 ? "❌" : statusCode >= 300 ? "⚠️" : "✅";

    console.log(
      `\n${statusColor} Response: ${statusCode} | Duration: ${duration}ms`
    );

    // Try to parse and log response body
    try {
      if (typeof data === "string") {
        const parsed = JSON.parse(data);
        // Don't log sensitive fields
        const safeData = JSON.parse(JSON.stringify(parsed));
        if (safeData.data?.accessToken) safeData.data.accessToken = "***";
        if (safeData.data?.refreshToken) safeData.data.refreshToken = "***";
        console.log(`Response Data:`, safeData);
      }
    } catch (e) {
      // Not JSON, just log as is
      console.log(`Response: ${data?.substring(0, 100) || "Empty"}`);
    }

    console.log(`${"=".repeat(80)}\n`);

    return originalSend.call(this, data);
  };

  next();
};

export default logRequest;
