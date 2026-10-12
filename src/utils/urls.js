export const local = (s) => (!s || /^(?:[a-z]+:|#|\/)/i.test(s) ? s : "/" + s);
