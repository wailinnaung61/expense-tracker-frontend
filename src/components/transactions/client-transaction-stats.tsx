import TransactionStats from "./transaction-stats";
import { useAuth } from "@/contexts/AuthContext";

interface ClientTransactionStatsProps {
  refreshKey?: number;
}

export default function ClientTransactionStats({ refreshKey }: ClientTransactionStatsProps) {
  const { user } = useAuth();
  return <TransactionStats currency={user?.currency || "USD"} refreshKey={refreshKey} />;
}
