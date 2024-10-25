import { credits, payments } from "@/db/schema";

export type Credit = typeof credits.$inferSelect;
export type Payment = typeof payments.$inferSelect;
