(function executeRule(current, previous) {

    updateBudget(current.getValue('monthly_budget'));

    if (previous && previous.getValue('monthly_budget') != current.getValue('monthly_budget')) {
        updateBudget(previous.getValue('monthly_budget'));
    }

    function updateBudget(budgetId) {
        if (!budgetId) return;

        var total = 0;
        var gr = new GlideRecord('x_2169755_family_0_daily_expense');
        gr.addQuery('monthly_budget', budgetId);
        gr.query();
        while (gr.next()) {
            total += parseFloat(gr.getValue('amount')) || 0;
        }

        var budget = new GlideRecord('x_2169755_family_0_monthly_budget');
        if (!budget.get(budgetId)) return;

        var allocated = parseFloat(budget.getValue('allocated_budget')) || 0;
        var remaining = allocated - total;
        var status = 'Within Budget';

        if (total > allocated) {
            status = 'Exceeded';
        } else if (allocated > 0 && (remaining / allocated) <= 0.15) {
            status = 'Warning';
        }

        budget.setValue('total_spent', total);
        budget.setValue('remaining_budget', remaining);
        budget.setValue('status', status);
        budget.update();
    }

})(current, previous);
