export function isInvalidEmail(email: string): boolean {
  // 南京大学本科生校邮
  return !/^\d{9}@smail\.nju\.edu\.cn$/.test(email);
}

export function isInvalidPhone(phone: string): boolean {
  let result = false;
  if (phone) {
    result = /^(([0+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test(phone) ||
      /^(\d{7,8})(-(\d{3,}))?$/.test(phone) ||
      /^1(((8\d|4[579]|[35][012356789]|66|7[1235678]|9[189])\d)|34[0-8])\d{7}$/.test(phone);
  }
  return !result;
}
