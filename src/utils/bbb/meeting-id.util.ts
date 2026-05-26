export function generateMeetingID(
  title: string,
  course: string,
  groupId: string,
): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 20);

  const timestamp = Date.now();

  return `${course}-${groupId}-${slug}-${timestamp}`;
}