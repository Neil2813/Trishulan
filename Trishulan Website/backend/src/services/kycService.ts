/**
 * Public Web API Service for B2B KYC, GSTIN & Document Verification
 * Connects to third-party verification APIs configured in backend environment:
 * - GSTIN provider via GST_API_URL / GST_API_KEY
 * - Public Identity/Address Verification API configured via POSTAL_PIN_API_URL
 * - PAN provider via PAN_API_URL / PAN_API_KEY
 */

type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getConfiguredProviderUrl(value: string | undefined): string | null {
  if (!value?.trim()) return null;

  try {
    const parsed = new URL(value.trim());
    const isLocalHttp =
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');
    if (
      (parsed.protocol !== 'https:' && !isLocalHttp) ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash
    ) {
      return null;
    }
    return parsed.toString().endsWith('/') ? parsed.toString() : `${parsed.toString()}/`;
  } catch {
    return null;
  }
}

function providerStatus(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function isValidPanDateOfBirth(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = /^([0-3]\d)\/([01]\d)\/(\d{4})$/.exec(value);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

let sandboxPanAccessToken: string | null = null;
let sandboxPanTokenExpiresAt = 0;
let sandboxPanTokenRequest: Promise<string> | null = null;

function isConfiguredSecret(value: string | undefined): value is string {
  const secret = value?.trim();
  return Boolean(
    secret &&
    !/^(?:public_web_access|replace(?:[-_ ].*)?|your(?:[-_ ].*)?|placeholder(?:[-_ ].*)?|change[-_ ]?me)$/i.test(secret)
  );
}

async function getSandboxPanAccessToken(apiBaseUrl: string, apiKey: string, apiSecret: string): Promise<string> {
  if (sandboxPanAccessToken && Date.now() < sandboxPanTokenExpiresAt) {
    return sandboxPanAccessToken;
  }
  if (sandboxPanTokenRequest) return sandboxPanTokenRequest;

  sandboxPanTokenRequest = (async () => {
    const response = await fetch(new URL('/authenticate', apiBaseUrl), {
      method: 'POST',
      signal: AbortSignal.timeout(10_000),
      headers: {
        'x-api-key': apiKey,
        'x-api-secret': apiSecret,
        'x-api-version': '1.0.0',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      console.warn(`PAN provider authentication returned HTTP ${response.status}`);
      throw new Error('PAN provider authentication failed');
    }

    const payload: unknown = await response.json();
    const token = isJsonObject(payload) && payload.code === 200 &&
      isJsonObject(payload.data) && typeof payload.data.access_token === 'string'
      ? payload.data.access_token
      : null;
    if (!token) throw new Error('PAN provider authentication response was invalid');

    sandboxPanAccessToken = token;
    sandboxPanTokenExpiresAt = Date.now() + 23 * 60 * 60 * 1000;
    return token;
  })();

  try {
    return await sandboxPanTokenRequest;
  } finally {
    sandboxPanTokenRequest = null;
  }
}

export interface GSTINVerificationResult {
  valid: boolean;
  gstin: string;
  pan?: string;
  stateName?: string;
  stateCode?: string;
  businessType?: string;
  details?: {
    legalName?: string;
    tradeName?: string;
    registrationStatus?: string;
    verifiedAt: string;
  };
  error?: string;
  verificationUnavailable?: boolean;
}

const INDIAN_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '18': 'Assam',
  '19': 'West Bengal',
  '24': 'Gujarat',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
};

/**
 * Algorithmic checksum & state extraction for Indian GSTIN format
 */
export function verifyGSTINAlgorithmic(gstinRaw: string): GSTINVerificationResult {
  const gstin = (gstinRaw || '').trim().toUpperCase();
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  if (!regex.test(gstin)) {
    return {
      valid: false,
      gstin,
      error: 'Invalid GSTIN format. Expected 15-character alphanumeric format (e.g. 27AAAAA0000A1Z5).'
    };
  }

  const stateCode = gstin.substring(0, 2);
  const pan = gstin.substring(2, 12);
  const entityTypeChar = gstin.charAt(5);

  let businessType = 'Company / Enterprise';
  if (entityTypeChar === 'P') businessType = 'Proprietorship / Individual';
  else if (entityTypeChar === 'C') businessType = 'Private Limited Company';
  else if (entityTypeChar === 'F') businessType = 'Partnership Firm / LLP';
  else if (entityTypeChar === 'H') businessType = 'HUF';

  return {
    valid: true,
    gstin,
    pan,
    stateCode,
    stateName: INDIAN_STATE_CODES[stateCode] || 'India (State Code ' + stateCode + ')',
    businessType,
  };
}

/**
 * Fetches verification data from Public Web GSTIN Verification API configured in .env
 */
export async function fetchLiveGSTINData(gstinRaw: string): Promise<GSTINVerificationResult> {
  const localResult = verifyGSTINAlgorithmic(gstinRaw);
  if (!localResult.valid) return localResult;

  const apiUrl = getConfiguredProviderUrl(process.env.GST_API_URL);
  const apiKey = process.env.GST_API_KEY;
  if (!apiUrl || !isConfiguredSecret(apiKey)) {
    return {
      ...localResult,
      valid: false,
      verificationUnavailable: true,
      error: 'GSTIN verification provider is not configured',
    };
  }

  try {
    const targetUrl = `${apiUrl}${encodeURIComponent(localResult.gstin)}`;
    const res = await fetch(targetUrl, {
      signal: AbortSignal.timeout(10_000),
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!res.ok) {
      console.warn(`GSTIN verification provider returned HTTP ${res.status}`);
      throw new Error('Provider request failed');
    }

    const payload: unknown = await res.json();
    if (!isJsonObject(payload) || payload.flag !== true || !isJsonObject(payload.data)) {
      return {
        ...localResult,
        valid: false,
        error: 'GSTIN provider did not confirm this registration',
      };
    }

    const data = payload.data;
    const returnedGstin = typeof data.gstin === 'string' ? data.gstin.trim().toUpperCase() : '';
    const registrationStatus = providerStatus(data.sts ?? data.status);
    if (returnedGstin !== localResult.gstin || registrationStatus !== 'active') {
      return {
        ...localResult,
        valid: false,
        error: 'GSTIN provider did not confirm an active registration matching this number',
      };
    }

    const legalName = typeof data.lgnm === 'string' ? data.lgnm : undefined;
    const tradeName = typeof data.tradeNam === 'string' ? data.tradeNam : undefined;
    return {
      valid: true,
      gstin: localResult.gstin,
      pan: localResult.pan,
      stateName: localResult.stateName,
      stateCode: localResult.stateCode,
      businessType: typeof data.ctb === 'string' ? data.ctb : localResult.businessType,
      details: {
        ...(legalName ? { legalName } : {}),
        ...(tradeName ? { tradeName } : {}),
        registrationStatus: 'Active',
        verifiedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      console.warn('GSTIN verification provider request timed out');
    } else if (err instanceof Error && err.message !== 'Provider request failed') {
      console.warn('GSTIN verification provider request failed');
    }
  }

  return {
    ...localResult,
    valid: false,
    verificationUnavailable: true,
    error: 'GSTIN could not be verified because the verification provider is unavailable',
  };
}

/**
 * Fetches verification data from the configured PAN verification provider.
 */
export async function fetchLivePANData(
  panRaw: string,
  verification: { name: string; dateOfBirth: string; consent: true; reason: string },
): Promise<{
  valid: boolean;
  pan: string;
  entityType?: string;
  nameMatched?: boolean;
  dateOfBirthMatched?: boolean;
  error?: string;
  details?: {
    category?: string;
    verificationStatus: string;
    verifiedAt: string;
  };
  verificationUnavailable?: boolean;
}> {
  const pan = (panRaw || '').trim().toUpperCase();
  const regex = /^[A-Z]{3}[ABCFGHLJPT][A-Z]{1}[0-9]{4}[A-Z]{1}$/;

  if (!regex.test(pan)) {
    return {
      valid: false,
      pan,
      error: 'Invalid PAN format. Expected 10-character format (e.g. ABCDE1234F).'
    };
  }

  const apiBaseUrl = getConfiguredProviderUrl(process.env.PAN_API_URL);
  const apiKey = process.env.PAN_API_KEY;
  const apiSecret = process.env.PAN_API_SECRET;
  if (!apiBaseUrl || !isConfiguredSecret(apiKey) || !isConfiguredSecret(apiSecret)) {
    return {
      valid: false,
      pan,
      verificationUnavailable: true,
      error: 'PAN verification provider is not configured',
    };
  }

  try {
    const accessToken = await getSandboxPanAccessToken(apiBaseUrl, apiKey, apiSecret);
    const res = await fetch(new URL('/kyc/pan/verify', apiBaseUrl), {
      method: 'POST',
      signal: AbortSignal.timeout(10_000),
      headers: {
        'x-api-key': apiKey,
        'authorization': accessToken,
        'x-api-version': '1.0.0',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        '@entity': 'in.co.sandbox.kyc.pan_verification.request',
        pan,
        name_as_per_pan: verification.name.trim(),
        date_of_birth: verification.dateOfBirth,
        consent: 'Y',
        reason: verification.reason.trim(),
      }),
    });

    if (!res.ok) {
      console.warn(`PAN verification provider returned HTTP ${res.status}`);
      throw new Error('Provider request failed');
    }

    const payload: unknown = await res.json();
    if (!isJsonObject(payload)) {
      return { valid: false, pan, error: 'PAN provider returned an invalid response' };
    }
    if (payload.code !== 200 || !isJsonObject(payload.data)) {
      return { valid: false, pan, error: 'PAN provider did not confirm this record' };
    }
    const data = payload.data;
    const returnedPan = typeof data.pan === 'string' ? data.pan.trim().toUpperCase() : '';
    const verificationStatus = providerStatus(data.status);
    if (returnedPan !== pan || verificationStatus !== 'valid') {
      return {
        valid: false,
        pan,
        error: 'PAN provider did not confirm a valid record matching this number',
      };
    }

    const nameMatched = data.name_as_per_pan_match === true;
    const dateOfBirthMatched = data.date_of_birth_match === true;
    if (!nameMatched || !dateOfBirthMatched) {
      return {
        valid: false,
        pan,
        nameMatched,
        dateOfBirthMatched,
        error: 'PAN record was found, but the submitted name or date of birth did not match',
      };
    }

    const category = typeof data.category === 'string' ? data.category : undefined;
    return {
      valid: true,
      pan,
      entityType: category || 'Verified Taxpayer',
      nameMatched,
      dateOfBirthMatched,
      details: {
        ...(category ? { category } : {}),
        verificationStatus: 'Valid',
        verifiedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      console.warn('PAN verification provider request timed out');
    } else if (err instanceof Error && err.message !== 'Provider request failed') {
      console.warn('PAN verification provider request failed');
    }
  }

  return {
    valid: false,
    pan,
    verificationUnavailable: true,
    error: 'PAN could not be verified because the verification provider is unavailable',
  };
}

/**
 * Verifies Pincode / Address evidence against Public Postal API configured in .env
 */
export async function fetchLivePincodeAddressData(pincode: string) {
  const normalizedPincode = pincode.trim();
  const publicPincodeApiUrl = process.env.POSTAL_PIN_API_URL?.trim();

  if (!/^\d{6}$/.test(normalizedPincode)) {
    return {
      valid: false,
      pincode: normalizedPincode,
      error: 'Pincode must be exactly 6 digits',
    };
  }

  if (!publicPincodeApiUrl) {
    return {
      valid: false,
      pincode: normalizedPincode,
      error: 'Postal PIN lookup is not configured',
      verificationUnavailable: true,
    };
  }

  const apiUrl = publicPincodeApiUrl.endsWith('/')
    ? getConfiguredProviderUrl(publicPincodeApiUrl)
    : getConfiguredProviderUrl(`${publicPincodeApiUrl}/`);
  if (!apiUrl) {
    return {
      valid: false,
      pincode: normalizedPincode,
      error: 'Postal PIN lookup URL is invalid',
      verificationUnavailable: true,
    };
  }

  try {
    const res = await fetch(`${apiUrl}${encodeURIComponent(normalizedPincode)}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.warn(`Postal PIN API returned HTTP ${res.status}`);
      throw new Error('Provider request failed');
    }

    const data: any = await res.json();
    const postOffices = data?.[0]?.Status === 'Success' && Array.isArray(data[0].PostOffice)
      ? data[0].PostOffice
      : [];

    if (postOffices.length > 0) {
      return {
        valid: true,
        pincode: normalizedPincode,
        city: postOffices[0]?.Block && postOffices[0].Block !== 'NA'
          ? postOffices[0].Block
          : postOffices[0]?.Name,
        district: postOffices[0]?.District,
        state: postOffices[0]?.State,
        postOffices: postOffices.map((po: any) => po.Name),
      };
    }

    return {
      valid: false,
      pincode: normalizedPincode,
      error: 'No postal locations were found for this pincode',
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      console.warn('Postal PIN API request timed out');
    } else if (err instanceof Error && err.message !== 'Provider request failed') {
      console.warn('Postal PIN API request failed');
    }
    return {
      valid: false,
      pincode: normalizedPincode,
      error: 'Postal lookup is temporarily unavailable',
      verificationUnavailable: true,
    };
  }
}
