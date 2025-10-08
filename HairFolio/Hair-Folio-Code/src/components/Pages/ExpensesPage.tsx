import { ExpenseForm } from '@/components/Forms/ExpenseForm';
import { ExpenseList } from '@/components/Expenses/ExpenseList';

export function ExpensesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <ExpenseForm />
      <ExpenseList />
    </div>
  );
}