# Official Test Procedure - Barbershop Financial Tracker

**Version:** 1.0  
**Date:** 2025-10-06  
**Purpose:** Comprehensive testing protocol for validating all features and functionality

---

## Prerequisites

- [ ] Application is running and accessible
- [ ] Test data has been cleared or isolated test environment is prepared
- [ ] Browser console is open for error monitoring
- [ ] Network tab is open for API call monitoring

---

## 1. Authentication Testing

### 1.1 User Registration
- [ ] Navigate to the authentication page
- [ ] Enter valid email and password
- [ ] Click "Sign Up"
- [ ] **Expected:** User account is created successfully
- [ ] **Expected:** User is redirected to dashboard

### 1.2 User Login
- [ ] Log out if currently logged in
- [ ] Enter registered email and password
- [ ] Click "Sign In"
- [ ] **Expected:** User is authenticated and redirected to dashboard

### 1.3 Session Persistence
- [ ] Refresh the page while logged in
- [ ] **Expected:** User remains authenticated
- [ ] Close and reopen the browser
- [ ] **Expected:** User remains authenticated

---

## 2. Transaction (Income) Testing

### 2.1 Add New Transaction
- [ ] Navigate to Transactions page
- [ ] Click "Add Transaction" button
- [ ] Fill in the following:
  - Date: Today's date
  - Service/Style: "Haircut"
  - Price: 50
  - Notes: "Test customer - regular"
- [ ] Click "Save"
- [ ] **Expected:** Transaction appears in the list
- [ ] **Expected:** Success toast notification appears
- [ ] **Expected:** Dashboard KPIs update immediately

### 2.2 Edit Transaction
- [ ] Click edit icon on the test transaction
- [ ] Change price from 50 to 60
- [ ] Change service to "Fade"
- [ ] Click "Save"
- [ ] **Expected:** Transaction updates in the list
- [ ] **Expected:** Dashboard reflects updated values

### 2.3 Delete Transaction
- [ ] Click delete icon on the test transaction
- [ ] Confirm deletion in the dialog
- [ ] **Expected:** Transaction is removed from list
- [ ] **Expected:** Dashboard KPIs update accordingly

### 2.4 Bulk Transaction Entry
- [ ] Add 5 transactions with different:
  - Services (Haircut, Fade, Beard Trim, Shave, Color)
  - Prices (ranging from 25 to 150)
  - Dates (spread across current month)
- [ ] **Expected:** All transactions save successfully
- [ ] **Expected:** No performance degradation

---

## 3. Expense Testing

### 3.1 Add Fixed Expense
- [ ] Navigate to Expenses page
- [ ] Click "Add Expense" button
- [ ] Fill in the following:
  - Date: Today's date
  - Type: "Fixed"
  - Description: "Shop Rent"
  - Amount: 1500
- [ ] Click "Save"
- [ ] **Expected:** Expense appears in the list
- [ ] **Expected:** Dashboard shows updated expense totals

### 3.2 Add Short-term Expense
- [ ] Click "Add Expense" button
- [ ] Fill in the following:
  - Date: Today's date
  - Type: "Short-term"
  - Description: "Hair Products"
  - Amount: 250
- [ ] Click "Save"
- [ ] **Expected:** Expense appears with correct type

### 3.3 Edit Expense
- [ ] Click edit icon on "Hair Products" expense
- [ ] Change amount to 300
- [ ] Change description to "Hair Products - Premium"
- [ ] Click "Save"
- [ ] **Expected:** Expense updates correctly

### 3.4 Delete Expense
- [ ] Click delete icon on "Hair Products - Premium"
- [ ] Confirm deletion
- [ ] **Expected:** Expense is removed
- [ ] **Expected:** Totals recalculate correctly

---

## 4. Dashboard & Analytics Testing

### 4.1 KPI Card Verification
- [ ] Navigate to Dashboard
- [ ] Verify the following KPI cards display:
  - [ ] Total Income (with correct sum)
  - [ ] Total Expenses (with correct sum)
  - [ ] Net Profit (Income - Expenses)
  - [ ] Total Customers (transaction count)
- [ ] **Expected:** All values are accurate based on test data

### 4.2 Chart Verification
- [ ] Verify Income/Expense Chart displays correctly
- [ ] Verify Service Distribution Chart shows all services
- [ ] Verify Customer Trend Chart shows activity over time
- [ ] **Expected:** Charts are responsive and interactive
- [ ] **Expected:** Hover states show detailed information

### 4.3 Month Navigation
- [ ] Use month selector to navigate to previous month
- [ ] **Expected:** Dashboard updates with previous month's data
- [ ] Navigate back to current month
- [ ] **Expected:** Current month data displays correctly

---

## 5. Settings & Configuration Testing

### 5.1 Currency Display
- [ ] Navigate to Settings page
- [ ] Note current currency setting
- [ ] **Expected:** Current currency is displayed correctly

### 5.2 Default Services Management
- [ ] View the list of default services
- [ ] Add a new custom service: "Kids Haircut"
- [ ] **Expected:** Service appears in the list
- [ ] Remove a service from the list
- [ ] **Expected:** Service is removed

### 5.3 Profile Settings
- [ ] Update any profile settings if available
- [ ] **Expected:** Settings save and persist

---

## 6. Currency Conversion Testing

### 6.1 Convert to Different Currency
- [ ] Navigate to Settings page
- [ ] Add at least 3 transactions and 2 expenses in current currency
- [ ] Note the exact amounts:
  - Transaction 1: ___
  - Transaction 2: ___
  - Transaction 3: ___
  - Expense 1: ___
  - Expense 2: ___
- [ ] Change currency from USD to EUR (or any other currency)
- [ ] Confirm the conversion
- [ ] **Expected:** Brief processing occurs
- [ ] **Expected:** All transactions and expenses convert to new currency
- [ ] **Expected:** Conversion rates are applied correctly
- [ ] Navigate to Dashboard
- [ ] **Expected:** All KPIs show converted values

### 6.2 Convert Back to Original Currency
- [ ] Return to Settings
- [ ] Convert back to original currency
- [ ] **Expected:** Values convert back (may have minor rounding differences)
- [ ] Verify original approximate values are restored

---

## 7. Reports Testing

### 7.1 Generate Business Summary Report
- [ ] Navigate to Reports page
- [ ] Select "Business Summary" report
- [ ] Set date range: Current month
- [ ] Click "Generate Report"
- [ ] **Expected:** Report displays with:
  - Total income
  - Total expenses
  - Net profit
  - Total customers
  - Average transaction value

### 7.2 Generate Service Performance Report
- [ ] Select "Service Performance" report
- [ ] Set date range: Last 30 days
- [ ] Click "Generate Report"
- [ ] **Expected:** Report shows each service with:
  - Number of times performed
  - Total revenue
  - Percentage of total revenue

### 7.3 Generate Transaction History Report
- [ ] Select "Transaction History" report
- [ ] Set date range: Current month
- [ ] Click "Generate Report"
- [ ] **Expected:** All transactions listed chronologically
- [ ] **Expected:** All details are accurate

### 7.4 Generate Expense Breakdown Report
- [ ] Select "Expense Breakdown" report
- [ ] Set date range: Current month
- [ ] Click "Generate Report"
- [ ] **Expected:** Expenses grouped by type (Fixed/Short-term)
- [ ] **Expected:** Totals calculated correctly

### 7.5 Export Report
- [ ] Generate any report
- [ ] Click "Export PDF"
- [ ] **Expected:** PDF downloads successfully
- [ ] Open PDF file
- [ ] **Expected:** PDF contains all report data and is formatted correctly

---

## 8. Data Persistence Testing

### 8.1 Local Storage Persistence
- [ ] Add 2 transactions and 1 expense
- [ ] Close the browser completely
- [ ] Reopen the browser and navigate to the app
- [ ] **Expected:** All data is still present

### 8.2 Cross-Tab Synchronization
- [ ] Open the app in two browser tabs
- [ ] In Tab 1: Add a transaction
- [ ] In Tab 2: Refresh the page
- [ ] **Expected:** New transaction appears in Tab 2

---

## 9. Edge Case Testing

### 9.1 Zero Values
- [ ] Try to add a transaction with price = 0
- [ ] **Expected:** Validation error or allowed based on business rules
- [ ] Try to add an expense with amount = 0
- [ ] **Expected:** Consistent behavior with transactions

### 9.2 Negative Values
- [ ] Try to add a transaction with negative price
- [ ] **Expected:** Validation prevents negative values
- [ ] Try to add an expense with negative amount
- [ ] **Expected:** Validation prevents negative values

### 9.3 Very Large Values
- [ ] Add a transaction with price = 999,999
- [ ] **Expected:** System handles large numbers correctly
- [ ] **Expected:** Currency formatting displays correctly

### 9.4 Special Characters in Text Fields
- [ ] Add a transaction with notes containing: "Test & Co. <special>"
- [ ] **Expected:** Special characters are properly escaped and displayed
- [ ] Add an expense with description containing emojis: "💇‍♂️ Supplies"
- [ ] **Expected:** Emojis display correctly

### 9.5 Date Boundary Testing
- [ ] Add a transaction dated: January 1, 2024
- [ ] **Expected:** Date saves and displays correctly
- [ ] Add a transaction dated: December 31, 2024
- [ ] **Expected:** Date saves and displays correctly
- [ ] Try to add a transaction with a future date
- [ ] **Expected:** Allowed or prevented based on business rules

### 9.6 Empty Required Fields
- [ ] Try to save a transaction without selecting a service
- [ ] **Expected:** Validation error appears
- [ ] Try to save an expense without description
- [ ] **Expected:** Validation error appears

---

## 10. Performance Testing

### 10.1 Large Dataset Handling
- [ ] Add 50+ transactions
- [ ] Add 20+ expenses
- [ ] Navigate between pages
- [ ] **Expected:** No significant lag or performance issues
- [ ] **Expected:** Charts render smoothly

### 10.2 Concurrent Operations
- [ ] Rapidly add 5 transactions in succession
- [ ] **Expected:** All transactions save successfully
- [ ] **Expected:** No race conditions or data loss

---

## 11. UI/UX Testing

### 11.1 Responsive Design
- [ ] Test on desktop resolution (1920x1080)
- [ ] Test on tablet resolution (768x1024)
- [ ] Test on mobile resolution (375x667)
- [ ] **Expected:** Layout adapts appropriately
- [ ] **Expected:** All buttons and forms remain accessible

### 11.2 Navigation Testing
- [ ] Click through all navigation menu items
- [ ] **Expected:** Each page loads correctly
- [ ] Use browser back button
- [ ] **Expected:** Navigation works correctly

### 11.3 Form Validation Feedback
- [ ] Trigger various validation errors
- [ ] **Expected:** Clear error messages appear
- [ ] **Expected:** Form highlights problematic fields

### 11.4 Loading States
- [ ] Observe loading states during data operations
- [ ] **Expected:** Loading indicators appear appropriately
- [ ] **Expected:** No "flash of empty content"

---

## 12. Error Handling Testing

### 12.1 Network Errors
- [ ] Simulate offline mode (disconnect internet)
- [ ] Try to add a transaction
- [ ] **Expected:** Appropriate error message appears
- [ ] Reconnect internet
- [ ] **Expected:** App recovers gracefully

### 12.2 Database Errors
- [ ] Monitor console for any database errors
- [ ] **Expected:** No unhandled errors in console

---

## Test Results Summary

### Pass/Fail Criteria
- **PASS:** All expected outcomes achieved, no critical bugs
- **PARTIAL PASS:** Minor bugs present but core functionality works
- **FAIL:** Critical bugs prevent core functionality

### Test Execution Record

| Test Section | Status | Notes | Tester | Date |
|-------------|--------|-------|--------|------|
| 1. Authentication | ☐ | | | |
| 2. Transactions | ☐ | | | |
| 3. Expenses | ☐ | | | |
| 4. Dashboard | ☐ | | | |
| 5. Settings | ☐ | | | |
| 6. Currency Conversion | ☐ | | | |
| 7. Reports | ☐ | | | |
| 8. Data Persistence | ☐ | | | |
| 9. Edge Cases | ☐ | | | |
| 10. Performance | ☐ | | | |
| 11. UI/UX | ☐ | | | |
| 12. Error Handling | ☐ | | | |

### Issues Found

| Issue ID | Severity | Description | Steps to Reproduce | Status |
|----------|----------|-------------|-------------------|--------|
| | | | | |
| | | | | |

### Overall Test Result: ☐ PASS ☐ PARTIAL PASS ☐ FAIL

### Tester Sign-off

**Name:** _________________  
**Date:** _________________  
**Signature:** _________________

---

## Notes
- All tests should be performed in a clean test environment
- Document any deviations from expected behavior
- Report critical bugs immediately
- Update this document as new features are added
