// Transactions page with form and list
import { TransactionForm } from '@/components/Forms/TransactionForm';
import { TransactionList } from '@/components/Transactions/TransactionList';

export function TransactionsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <TransactionForm />
      <TransactionList />
    </div>
  );
}