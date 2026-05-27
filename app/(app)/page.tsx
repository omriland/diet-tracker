import { DayView } from "@/components/meals/day-view";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";

export default function TodayPage() {
  const today = getJerusalemDateString();
  return <DayView date={today} />;
}
