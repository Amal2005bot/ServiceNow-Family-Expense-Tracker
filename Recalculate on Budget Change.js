(function executeRule(current, previous) {

    var allocated = parseFloat(current.getValue('allocated_budget')) || 0;
    var spent = parseFloat(current.getValue('total_spent')) || 0;
    var remaining = allocated - spent;

    var status = 'Within Budget';
    if (spent > allocated) {
        status = 'Exceeded';
    } else if (allocated > 0 && (remaining / allocated) <= 0.15) {
        status = 'Warning';
    }

    current.setValue('remaining_budget', remaining);
    current.setValue('status', status);

})(current, previous);
