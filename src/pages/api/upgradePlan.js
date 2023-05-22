const apiKey = process.env.NEXT_PUBLIC_LEMONSQUEEZY_API_KEY;

export default async function handler(req, res) {
  try {
    // Fetch variant id
    const variantsResponse = await fetch(
      `https://api.lemonsqueezy.com/v1/variants`,
      {
        method: "GET",
        headers: {
          'Accept': 'application/vnd.api+json',
          "Content-Type": "application/vnd.api+json",
          "Authorization": `Bearer ${apiKey}`,
        }
      }
    );

    const variantsData = await variantsResponse.json();
    const variantId = variantsData.data[0]?.id;  // Assuming the data has this structure. Update if necessary.

    if (!variantId) {
      res.status(400).json({ error: 'Variant ID not found' });
      return;
    }

    // Create checkout with the obtained variant id
    const checkoutsResponse = await fetch(
      `https://api.lemonsqueezy.com/v1/checkouts`,
      {
        method: "POST",
        headers: {
          'Accept': 'application/vnd.api+json',
          "Content-Type": "application/vnd.api+json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          "data": {
            "type": "checkouts",
            "relationships": {
              "store": {
                "data": {
                  "type": "stores",
                  "id": "27742"
                }
              },
              "variant": {
                "data": {
                  "type": "variants",
                  "id": variantId  // Use the obtained variant id
                }
              }
            }
          }
        }),
      }
    );

    const checkoutsData = await checkoutsResponse.json();
    res.status(200).json(checkoutsData);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
}
