/** Country name → flag emoji for the onboarding country list. */

const FLAGS: Record<string, string> = {
  Switzerland: "🇨🇭", Germany: "🇩🇪", France: "🇫🇷", Italy: "🇮🇹",
  Austria: "🇦🇹", "United Kingdom": "🇬🇧", Ireland: "🇮🇪", Spain: "🇪🇸",
  Portugal: "🇵🇹", Netherlands: "🇳🇱", Belgium: "🇧🇪", Poland: "🇵🇱",
  Czechia: "🇨🇿", Sweden: "🇸🇪", Norway: "🇳🇴", Denmark: "🇩🇰",
  Finland: "🇫🇮", Greece: "🇬🇷", Turkey: "🇹🇷", "United States": "🇺🇸",
  Canada: "🇨🇦", Mexico: "🇲🇽", Brazil: "🇧🇷", Argentina: "🇦🇷",
  India: "🇮🇳", Pakistan: "🇵🇰", China: "🇨🇳", Japan: "🇯🇵",
  "South Korea": "🇰🇷", Singapore: "🇸🇬", Australia: "🇦🇺",
  "New Zealand": "🇳🇿", "South Africa": "🇿🇦", Nigeria: "🇳🇬",
  Kenya: "🇰🇪", Egypt: "🇪🇬", Russia: "🇷🇺", Cyprus: "🇨🇾",
};

export function flagFor(country: string | null | undefined): string {
  if (!country) return "🏳️";
  return FLAGS[country] ?? "🏳️";
}
