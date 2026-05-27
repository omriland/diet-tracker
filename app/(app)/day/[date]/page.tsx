import { notFound } from "next/navigation";
import { DayView } from "@/components/meals/day-view";
import { isValidDateString } from "@/lib/dates/jerusalem";

interface DayPageProps {
  params: Promise<{ date: string }>;
}

export default async function DayPage({ params }: DayPageProps) {
  const { date } = await params;
  if (!isValidDateString(date)) {
    notFound();
  }
  return <DayView date={date} />;
}
