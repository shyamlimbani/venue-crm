import dns from 'dns';

/** Prefer IPv4; use public DNS (helps Windows querySrv ECONNREFUSED) */
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const DEFAULT_DB = 'venue_crm';

/**
 * Ensures URI has a database path (e.g. /venue_crm) before query string.
 */
export function normalizeMongoUri(uri) {
  const trimmed = uri.trim();

  // mongodb+srv://user:pass@host/?query  →  .../venue_crm?query
  if (/^mongodb\+srv:\/\/[^/]+\?/.test(trimmed)) {
    return trimmed.replace(/^(mongodb\+srv:\/\/[^/]+)\?/, `$1/${DEFAULT_DB}?`);
  }

  // mongodb+srv://user:pass@host  (no path)
  if (/^mongodb\+srv:\/\/[^/]+$/.test(trimmed)) {
    return `${trimmed}/${DEFAULT_DB}`;
  }

  // mongodb+srv://user:pass@host/
  if (/^mongodb\+srv:\/\/[^/]+\/$/.test(trimmed)) {
    return `${trimmed}${DEFAULT_DB}`;
  }

  // mongodb://user:pass@host:27017/?query
  if (/^mongodb:\/\/[^/]+\?/.test(trimmed)) {
    return trimmed.replace(/^(mongodb:\/\/[^/]+)\?/, `$1/${DEFAULT_DB}?`);
  }

  if (/^mongodb:\/\/[^/]+$/.test(trimmed)) {
    return `${trimmed}/${DEFAULT_DB}`;
  }

  return trimmed;
}

/**
 * Converts mongodb+srv URI to standard mongodb:// on port 27017.
 * Bypasses SRV DNS lookup when Windows/firewall blocks querySrv.
 */
export function srvToStandardUri(srvUri) {
  const normalized = normalizeMongoUri(srvUri);
  const withoutScheme = normalized.replace('mongodb+srv://', '');
  const qIndex = withoutScheme.indexOf('?');
  const base = qIndex === -1 ? withoutScheme : withoutScheme.slice(0, qIndex);
  const query = qIndex === -1 ? '' : withoutScheme.slice(qIndex + 1);

  const atIndex = base.lastIndexOf('@');
  if (atIndex === -1) throw new Error('Invalid MONGO_URI: missing credentials');

  const credentials = base.slice(0, atIndex);
  const hostAndDb = base.slice(atIndex + 1);
  const slashIndex = hostAndDb.indexOf('/');
  const host = slashIndex === -1 ? hostAndDb : hostAndDb.slice(0, slashIndex);
  const db = slashIndex === -1 ? DEFAULT_DB : hostAndDb.slice(slashIndex + 1) || DEFAULT_DB;

  const params = new URLSearchParams(query);
  if (!params.has('ssl')) params.set('ssl', 'true');
  if (!params.has('authSource')) params.set('authSource', 'admin');
  if (!params.has('retryWrites')) params.set('retryWrites', 'true');
  if (!params.has('w')) params.set('w', 'majority');

  return `mongodb://${credentials}@${host}:27017/${db}?${params.toString()}`;
}

export function getConnectionUris(primaryUri, standardOverride) {
  const normalized = normalizeMongoUri(primaryUri);
  const uris = [normalized];

  if (standardOverride) {
    uris.push(normalizeMongoUri(standardOverride));
  } else if (normalized.startsWith('mongodb+srv://')) {
    uris.push(srvToStandardUri(normalized));
  }

  return [...new Set(uris)];
}
