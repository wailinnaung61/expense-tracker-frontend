import { Navigate } from "react-router-dom";

/** Old menu path — Email Sent now lives under Settings → Email. */
export default function EmailSentPage() {
  return <Navigate to="/setting?tab=email" replace />;
}
