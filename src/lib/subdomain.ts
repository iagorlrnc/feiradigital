export function getSubdomain(): "admin" | "dev" | "public" {
  const host = window.location.hostname

  // Check for subdomain (works in both production and localhost)
  if (host.includes(".")) {
    const parts = host.split(".")
    if (parts.length >= 2) {
      const subdomain = parts[0].toLowerCase()
      if (subdomain === "admin") return "admin"
      if (subdomain === "dev") return "dev"
    }
  }

  // Dev fallback via path prefix
  const path = window.location.pathname
  if (path.startsWith("/admin")) return "admin"
  if (path.startsWith("/dev")) return "dev"

  return "public"
}

export function getSubdomainUrl(
  targetSubdomain: "admin" | "dev" | "public",
  path: string = "/",
): string {
  const host = window.location.hostname
  const port = window.location.port
  const protocol = window.location.protocol
  const portString = port ? `:${port}` : ""

  // Extract root domain safely
  let rootDomain = host
  if (host.startsWith("admin.")) {
    rootDomain = host.replace("admin.", "")
  } else if (host.startsWith("dev.")) {
    rootDomain = host.replace("dev.", "")
  }

  // If public, we just want the root domain without admin/ceo subdomains
  if (targetSubdomain === "public") {
    return `${protocol}//${rootDomain}${portString}${path}`
  }

  // Otherwise, construct the full subdomain URL
  return `${protocol}//${targetSubdomain}.${rootDomain}${portString}${path}`
}
