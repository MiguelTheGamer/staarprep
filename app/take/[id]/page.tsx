/**
 * app/take/[id]/page.tsx
 *
 * Public student-facing assignment page. Server component shell that mounts
 * the client component. No auth required: this page is reachable by anyone
 * with the assignment link, by design (students don't have accounts).
 */
import { TakeClient } from "./TakeClient";

export default function TakePage({ params }: { params: { id: string } }) {
  return <TakeClient assignmentId={params.id} />;
}
