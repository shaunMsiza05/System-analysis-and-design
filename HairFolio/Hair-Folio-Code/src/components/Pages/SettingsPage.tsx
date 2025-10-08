// Settings page for app configuration
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Plus, X, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { z } from 'zod';

import { useSupabaseStore } from '@/hooks/useSupabaseStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const settingsFormSchema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  defaultStyles: z.array(z.string()).min(1, 'At least one service style is required'),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

const currencies = [
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'CAD', name: 'Canadian Dollar (C$)' },
  { code: 'AUD', name: 'Australian Dollar (A$)' },
  { code: 'JPY', name: 'Japanese Yen (¥)' },
  { code: 'ZAR', name: 'South African Rand (R)' },
  { code: 'INR', name: 'Indian Rupee (₹)' },
  { code: 'BRL', name: 'Brazilian Real (R$)' },
  { code: 'CNY', name: 'Chinese Yuan (¥)' },
];

interface SettingsPageProps {
  className?: string;
}

export function SettingsPage({ className }: SettingsPageProps) {
  const { settings, updateSettings, transactions, expenses, loadData } = useSupabaseStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [newStyle, setNewStyle] = useState('');

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      currency: settings.currency,
      defaultStyles: settings.defaultStyles,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      const oldCurrency = settings.currency;
      const newCurrency = data.currency;
      
      // If currency changed, convert all existing transactions and expenses
      if (oldCurrency !== newCurrency && (transactions.length > 0 || expenses.length > 0)) {
        const exchangeRates: Record<string, Record<string, number>> = {
          'USD': { 'ZAR': 18.5, 'EUR': 0.92, 'GBP': 0.79, 'CAD': 1.36, 'AUD': 1.52, 'JPY': 149.5, 'INR': 83.2, 'BRL': 4.97, 'CNY': 7.24 },
          'ZAR': { 'USD': 0.054, 'EUR': 0.05, 'GBP': 0.043, 'CAD': 0.074, 'AUD': 0.082, 'JPY': 8.08, 'INR': 4.5, 'BRL': 0.27, 'CNY': 0.39 },
          'EUR': { 'USD': 1.09, 'ZAR': 20.1, 'GBP': 0.86, 'CAD': 1.48, 'AUD': 1.65, 'JPY': 162.5, 'INR': 90.4, 'BRL': 5.41, 'CNY': 7.87 },
          'GBP': { 'USD': 1.27, 'ZAR': 23.4, 'EUR': 1.16, 'CAD': 1.72, 'AUD': 1.92, 'JPY': 189.2, 'INR': 105.3, 'BRL': 6.3, 'CNY': 9.16 },
          'CAD': { 'USD': 0.74, 'ZAR': 13.6, 'EUR': 0.68, 'GBP': 0.58, 'AUD': 1.12, 'JPY': 110, 'INR': 61.2, 'BRL': 3.66, 'CNY': 5.33 },
          'AUD': { 'USD': 0.66, 'ZAR': 12.2, 'EUR': 0.61, 'GBP': 0.52, 'CAD': 0.89, 'JPY': 98.3, 'INR': 54.7, 'BRL': 3.27, 'CNY': 4.76 },
          'JPY': { 'USD': 0.0067, 'ZAR': 0.124, 'EUR': 0.0062, 'GBP': 0.0053, 'CAD': 0.0091, 'AUD': 0.0102, 'INR': 0.56, 'BRL': 0.033, 'CNY': 0.048 },
          'INR': { 'USD': 0.012, 'ZAR': 0.22, 'EUR': 0.011, 'GBP': 0.0095, 'CAD': 0.016, 'AUD': 0.018, 'JPY': 1.8, 'BRL': 0.06, 'CNY': 0.087 },
          'BRL': { 'USD': 0.20, 'ZAR': 3.72, 'EUR': 0.18, 'GBP': 0.16, 'CAD': 0.27, 'AUD': 0.31, 'JPY': 30.1, 'INR': 16.7, 'CNY': 1.46 },
          'CNY': { 'USD': 0.14, 'ZAR': 2.55, 'EUR': 0.13, 'GBP': 0.11, 'CAD': 0.19, 'AUD': 0.21, 'JPY': 20.6, 'INR': 11.5, 'BRL': 0.68 }
        };
        
        const rate = exchangeRates[oldCurrency]?.[newCurrency] || 1;
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        const userId = user.id;
        
        // Update all transactions in parallel
        const transactionUpdates = transactions.map(transaction => {
          const convertedPrice = transaction.price * rate;
          return supabase
            .from('transactions')
            .update({ price: convertedPrice })
            .eq('id', transaction.id)
            .eq('user_id', userId);
        });
        
        // Update all expenses in parallel
        const expenseUpdates = expenses.map(expense => {
          const convertedAmount = expense.amount * rate;
          return supabase
            .from('expenses')
            .update({ amount: convertedAmount })
            .eq('id', expense.id)
            .eq('user_id', userId);
        });
        
        // Wait for all updates to complete
        await Promise.all([...transactionUpdates, ...expenseUpdates]);
        
        toast({
          title: 'Currency Converted',
          description: `All transactions and expenses converted from ${oldCurrency} to ${newCurrency}`,
        });
      }
      
      await updateSettings(data);
      await loadData(); // Reload data to reflect currency changes
      
      toast({
        title: 'Settings Updated',
        description: 'Your preferences have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Delete all transactions
      const { error: transError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);
      
      if (transError) throw transError;
      
      // Delete all expenses
      const { error: expError } = await supabase
        .from('expenses')
        .delete()
        .eq('user_id', user.id);
      
      if (expError) throw expError;
      
      await loadData();
      
      toast({
        title: 'Data Reset',
        description: 'All transactions and expenses have been cleared.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const addStyle = () => {
    if (!newStyle.trim()) return;
    
    const currentStyles = form.getValues('defaultStyles');
    if (!currentStyles.includes(newStyle.trim())) {
      form.setValue('defaultStyles', [...currentStyles, newStyle.trim()]);
      setNewStyle('');
    }
  };

  const removeStyle = (styleToRemove: string) => {
    const currentStyles = form.getValues('defaultStyles');
    form.setValue('defaultStyles', currentStyles.filter(style => style !== styleToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addStyle();
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Currency Selection */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Default Services/Styles */}
              <FormField
                control={form.control}
                name="defaultStyles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quick-Pick Services</FormLabel>
                    <div className="space-y-3">
                      {/* Add new style */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add new service..."
                          value={newStyle}
                          onChange={(e) => setNewStyle(e.target.value)}
                          onKeyPress={handleKeyPress}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addStyle}
                          disabled={!newStyle.trim()}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Current styles */}
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((style) => (
                          <div
                            key={style}
                            className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm"
                          >
                            <span>{style}</span>
                            <button
                              type="button"
                              onClick={() => removeStyle(style)}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full gradient-primary text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Reset Data Section */}
      <Card className="max-w-2xl border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Reset All Data</h3>
              <p className="text-sm text-muted-foreground">
                Clear all transactions and expenses to restart the app
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isResetting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your
                    transactions and expenses from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isResetting ? 'Resetting...' : 'Yes, reset everything'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}