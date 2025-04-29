export function generateSecChUa(): string {
  // List of possible browser brands
  const brands = [
    "Chromium",
    "Google Chrome",
    "Not(A:Brand", // Generic fallback brand
    "Microsoft Edge",
    "Firefox",
    "Safari",
  ];

  // Generate random versions (e.g., between 100 and 130 for recent versions)
  const getRandomVersion = (): number => Math.floor(Math.random() * 31) + 100; // Random version between 100 and 130

  // Shuffle and select 2-3 brands (including a fallback)
  const selectedBrands = brands.sort(() => 0.5 - Math.random()).slice(0, 3);

  // Ensure "Not(A:Brand" is always included as a fallback
  if (!selectedBrands.includes("Not(A:Brand")) {
    selectedBrands.pop(); // Remove the last brand if we have 3
    selectedBrands.push("Not(A:Brand");
  }

  // Map brands to sec-ch-ua format
  const secChUaParts = selectedBrands.map((brand) => {
    const version =
      brand === "Not(A:Brand"
        ? Math.floor(Math.random() * 50) + 1
        : getRandomVersion(); // Lower versions for fallback
    return `"${brand}";v="${version}"`;
  });

  // Join parts with commas
  return secChUaParts.join(", ");
}

// Example usage
if (require.main === module) {
  console.log("Generated sec-ch-ua:", generateSecChUa());
}
export function generateUserAgent(): string {
  // List of possible browsers, platforms, and devices
  const browsers = ["Chrome", "Firefox", "Safari", "Edge", "Opera"];

  const platforms = [
    "Windows NT 10.0", // Windows 10
    "Macintosh; Intel Mac OS X 14_0", // macOS Sonoma
    "Linux x86_64", // Linux
    "Android 13", // Android
    "iPhone; CPU iPhone OS 17_0 like Mac OS X", // iPhone
  ];

  const devices = [
    "Mobile", // Mobile device
    "", // Desktop (empty string for no device)
  ];

  // Randomly select components
  const browser = browsers[Math.floor(Math.random() * browsers.length)];
  const platform = platforms[Math.floor(Math.random() * platforms.length)];
  const device = devices[Math.floor(Math.random() * devices.length)]
    ? ` (${devices[Math.floor(Math.random() * devices.length)]})`
    : "";
  const version = Math.floor(Math.random() * 100) + 90; // Random version (e.g., 92, 95)

  // Construct the User-Agent string
  let userAgent = "";

  switch (browser) {
    case "Chrome":
      userAgent = `Mozilla/5.0 ${device} ${platform}; rv:${version}.0) Gecko/20100101 ${browser}/${version}.0.0 Safari/537.36`;
      break;
    case "Firefox":
      userAgent = `Mozilla/5.0 ${device} ${platform}; rv:${version}.0) Gecko/20100101 ${browser}/${version}.0`;
      break;
    case "Safari":
      userAgent = `Mozilla/5.0 ${device} ${platform} AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version}.0 Safari/605.1.15`;
      break;
    case "Edge":
      userAgent = `Mozilla/5.0 ${device} ${platform} AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/${version}.0 Safari/537.36`;
      break;
    case "Opera":
      userAgent = `Mozilla/5.0 ${device} ${platform} AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/${version}.0 Safari/537.36`;
      break;
    default:
      userAgent = `Mozilla/5.0 ${device} ${platform} (KHTML, like Gecko) ${browser}/${version}.0 Safari/537.36`;
  }

  return userAgent;
}

export function generateVietnameseUsername() {
  // Common Vietnamese first names and last names (simplified)
  const firstNames = [
    "Nguyen",
    "Tran",
    "Le",
    "Pham",
    "Hoang",
    "Vu",
    "Dang",
    "Bui",
    "Do",
    "Duong",
  ];
  const middleNames = [
    "Van",
    "Thi",
    "Quang",
    "Minh",
    "Duc",
    "Huy",
    "Khanh",
    "Phuong",
    "Thanh",
    "Tuan",
  ];
  const lastNames = [
    "Hao",
    "Linh",
    "Nam",
    "Anh",
    "Dung",
    "Hoa",
    "Mai",
    "Lan",
    "Nhi",
    "Truc",
  ];

  // Get random elements
  const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomMiddle =
    middleNames[Math.floor(Math.random() * middleNames.length)];
  const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
  const randomNumber = Math.floor(Math.random() * 1000); // Up to 999

  // Combine elements with Vietnamese naming pattern
  const patterns = [
    `${randomFirst}${randomMiddle}${randomLast}${randomNumber}`,
    `${randomFirst}${randomLast}${randomMiddle}${randomNumber}`,
    `${randomLast}${randomFirst}${randomNumber}`,
    `${randomFirst}${randomNumber}${randomLast}`,
  ];

  // Select random pattern and convert to lowercase
  const username =
    patterns[Math.floor(Math.random() * patterns.length)].toLowerCase();

  return username;
}

export function generateSecurePassword() {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  // Ensure at least one of each
  let password =
    lowercase[Math.floor(Math.random() * lowercase.length)] + // lowercase
    uppercase[Math.floor(Math.random() * uppercase.length)] + // uppercase
    numbers[Math.floor(Math.random() * numbers.length)]; // number

  const allChars = lowercase + uppercase + numbers;

  // Fill remaining 5 characters
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex];
  }

  // Shuffle the password
  password = password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  return password;
}
