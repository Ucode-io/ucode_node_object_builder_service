function updatePaidStatus(order, options) {
    const paidStatus = order.paid_status[0];
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === paidStatus) {
          order.paid_status = [options[i].label];
          labelFound = true;
          break;
        }
      }
    return order
  }

module.exports = updatePaidStatus