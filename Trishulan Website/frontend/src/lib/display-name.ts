const PLACEHOLDER_NAME = /not.?found|unknown|undefined|null|^user\d*$/i;

export function getAccountDisplayName(name?: string | null, email?: string | null): string {
  const savedName = name?.trim();
  if (savedName && !PLACEHOLDER_NAME.test(savedName)) return savedName;

  const emailName = email?.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
  if (emailName && !PLACEHOLDER_NAME.test(emailName)) {
    return emailName.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return '';
}
