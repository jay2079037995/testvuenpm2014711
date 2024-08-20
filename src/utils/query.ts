export const parseQueryString = (url?:string) => {
  if (!url) url = window.location.href
  const queryString = url.split('?')[1]
  const params:any = {}
  if (queryString) {
    const paramPairs = queryString.split('&')
    for (let i = 0; i < paramPairs.length; i++) {
      const pair = paramPairs[i].split('=')
      const paramName = decodeURIComponent(pair[0])
      const paramValue = decodeURIComponent(pair[1])
      params[paramName] = paramValue
    }
  }
  return params
}