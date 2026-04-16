/**
 * Serialize Mongoose documents for use in server-side components
 * Converts ObjectId, Date, and other non-serializable values to plain JS.
 */
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}