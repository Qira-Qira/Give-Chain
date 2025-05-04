import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const backendResponse = await fetch("http://localhost:4943/api/login", {
      method: "POST",
    });

    if (backendResponse.ok) {
      const data = await backendResponse.json();
      return res.status(200).json(data);
    } else {
      return res.status(backendResponse.status).json({ error: "Login failed" });
    }
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}
