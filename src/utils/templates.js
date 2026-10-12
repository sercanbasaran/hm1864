export function descendants(n, test, out = []) {
  if (n && typeof n !== "string") {
    if (test(n)) out.push(n);
    for (const c of n.children || []) descendants(c, test, out);
  }
  return out;
}
