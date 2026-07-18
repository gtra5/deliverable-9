const META = {
  bitcoin: { symbol: "BTC", name: "Bitcoin" },
  ethereum: { symbol: "ETH", name: "Ethereum" },
  solana: { symbol: "SOL", name: "Solana" },
};

export const COIN_IDS = ["bitcoin", "ethereum", "solana"];

export async function fetchPrices() {
  const ids = COIN_IDS.join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new Error(`CoinGecko error: network failure`);
  }
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
  const data = await res.json();
  return COIN_IDS.map((id) => ({
    id,
    symbol: META[id].symbol,
    name: META[id].name,
    price: data[id]?.usd ?? 0,
    change24h: data[id]?.usd_24h_change ?? 0,
  }));
}

export function coinMeta(id) {
  return META[id];
}
