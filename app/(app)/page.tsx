import { redirect } from "next/navigation";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";

export default function TodayPage() {
  redirect(`/day/${getJerusalemDateString()}`);
}
