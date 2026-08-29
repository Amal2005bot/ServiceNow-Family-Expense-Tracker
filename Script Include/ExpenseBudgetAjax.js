var ExpenseBudgetAjax = Class.create();
ExpenseBudgetAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    getRemainingBudget: function() {
        var budgetId = this.getParameter('sysparm_budget_id');
        if (!budgetId) return '0';

        var budget = new GlideRecord('x_2169755_family_0_monthly_budget');
        if (!budget.get(budgetId)) return '0';

        return budget.getValue('remaining_budget') || '0';
    },

    type: 'ExpenseBudgetAjax'
});
