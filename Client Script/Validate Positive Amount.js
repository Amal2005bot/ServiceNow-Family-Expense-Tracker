function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') return;

    if (parseFloat(newValue) <= 0) {
        g_form.showFieldMsg('amount', 'Amount must be greater than 0', 'error');
        return;
    } else {
        g_form.hideFieldMsg('amount', true);
    }

    var budgetId = g_form.getValue('monthly_budget');
    if (!budgetId) return;

    var ga = new GlideAjax('x_2169755_family_0.ExpenseBudgetAjax');
    ga.addParam('sysparm_name', 'getRemainingBudget');
    ga.addParam('sysparm_budget_id', budgetId);
    ga.getXMLAnswer(function(response) {
        var remainingBudget = parseFloat(response) || 0;  
        var amount = parseFloat(newValue);

        if (amount > remainingBudget) {
            var overage = (amount - remainingBudget).toFixed(2);
            g_form.addWarningMessage('This expense exceeds the remaining budget by ' + overage);
            g_form.showFieldMsg('amount', 'Over budget by ' + overage, 'warning');
        }
    });
}
