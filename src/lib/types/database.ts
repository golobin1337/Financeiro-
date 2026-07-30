export type TransactionType = "income" | "expense";
export type RecurringFrequency = "weekly" | "monthly" | "yearly";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  recurring_id: string | null;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  created_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category: Category | null;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  amount: number;
  created_at: string;
}

export interface BudgetWithCategory extends Budget {
  category: Category;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  description: string;
  frequency: RecurringFrequency;
  start_date: string;
  next_date: string;
  active: boolean;
  created_at: string;
}

export interface RecurringTransactionWithCategory extends RecurringTransaction {
  category: Category | null;
}
