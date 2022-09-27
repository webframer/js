// Check if the browser is Safari
export function isSafari () {
  return safariUserAgentPattern.test(navigator.userAgent)
}

export const safariUserAgentPattern = /^((?!chrome|android).)*safari/i
