const EXTRACTION_PROMPT = `You are a receipt data extraction assistant. Analyze this receipt image and extract the following fields.
Return ONLY a valid JSON object with no extra text, markdown, or explanation.

Required fields:
{
  "merchant_name": "Name of the store or business",
  "date": "Date in YYYY-MM-DD format",
  "total_amount": "Total amount as a number only (e.g. 7.90)",
  "currency": "Currency code (e.g. MYR, USD, SGD)",
  "items": [
    {"name": "item name", "qty": 1, "unit_price": 0.00, "total": 0.00}
  ],
  "tax": "Tax amount as number or null if not present",
  "payment_method": "Cash, Card, TNG, etc.",
  "receipt_number": "Receipt/invoice number if present or null"
}

Rules:
- For currency, detect from symbols (RM = MYR, $ = USD, etc.) or context
- If a field is not found, use null
- Dates must be in YYYY-MM-DD format
- All monetary values must be numbers, not strings`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { base64, mimeType } = req.body;
  if (!base64 || !mimeType) {
    return res.status(400).json({ error: 'Missing base64 or mimeType in request body' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable not set' });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: EXTRACTION_PROMPT },
              { inline_data: { mime_type: mimeType, data: base64 } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2000 }
        })
      }
    );

    const json = await geminiRes.json();

    if (!geminiRes.ok) {
      throw new Error(json.error?.message || 'Gemini API error');
    }

    const raw = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleaned);

    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Extraction failed' });
  }
}
