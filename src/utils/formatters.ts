/**
 * Format currency in Saudi Riyals (SAR)
 */
export function formatSAR(amount: number | undefined | null, showSymbol = true): string {
  const safeNum = Number(amount) || 0;
  const formatted = safeNum.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return showSymbol ? `${formatted} SAR` : formatted;
}

export function formatSAR_AR(amount: number | undefined | null): string {
  const safeNum = Number(amount) || 0;
  const formatted = safeNum.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ر.س`;
}

/**
 * Format date string (YYYY-MM-DD) to friendly format
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return dateString;
  } catch {
    return dateString;
  }
}

/**
 * Format date and time
 */
export function formatDateTime(date?: string, time?: string): string {
  if (!date) return '-';
  const dStr = formatDate(date);
  if (!time) return dStr;
  return `${dStr} ${time.substring(0, 5)}`;
}

/**
 * Helper to get current Date formatted as YYYY-MM-DD
 */
export function getCurrentDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper to get current Time formatted as HH:mm:ss
 */
export function getCurrentTime(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Helper to get current Year-Month string (YYYY-MM)
 */
export function getCurrentMonth(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatPercentage(value: number | undefined | null): string {
  const safe = Number(value) || 0;
  return `${safe.toFixed(1)}%`;
}

/**
 * Generates TLV Base64 string for standard Saudi ZATCA e-Invoicing QR compliance
 */
export function generateZatcaTlvQr(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  totalAmount: string,
  vatAmount: string
): string {
  try {
    const encodeTLV = (tag: number, value: string): Uint8Array => {
      const encoder = new TextEncoder();
      const valBytes = encoder.encode(value);
      const len = valBytes.length;
      const tlv = new Uint8Array(2 + len);
      tlv[0] = tag;
      tlv[1] = len;
      tlv.set(valBytes, 2);
      return tlv;
    };

    const tlv1 = encodeTLV(1, sellerName || 'Saudi Restaurant Co.');
    const tlv2 = encodeTLV(2, vatNumber || '300000000000003');
    const tlv3 = encodeTLV(3, timestamp || new Date().toISOString());
    const tlv4 = encodeTLV(4, totalAmount || '0.00');
    const tlv5 = encodeTLV(5, vatAmount || '0.00');

    const totalLen = tlv1.length + tlv2.length + tlv3.length + tlv4.length + tlv5.length;
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const arr of [tlv1, tlv2, tlv3, tlv4, tlv5]) {
      combined.set(arr, offset);
      offset += arr.length;
    }

    let binary = '';
    for (let i = 0; i < combined.length; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
  } catch {
    return btoa(sellerName + '|' + vatNumber + '|' + totalAmount);
  }
}
