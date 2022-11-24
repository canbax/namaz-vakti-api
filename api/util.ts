export function prefix0(n: number) {
  if (n > 99 || n < -99) throw "Can only process 2 digits integers!";
  return (n + "").padStart(2, "0");
}

export function extractTimeFromDate(d: Date) {
  const hour = d.getHours();
  const minute = d.getMinutes();
  return prefix0(hour) + ":" + prefix0(minute);
}
