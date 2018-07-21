/**
* Create a new Watch
*@param {org.watchain.firstHand.CreateWatch} createWatch - the watch
* @transaction
*/
async function createWatch(createWatch) {
  
    let watch = createWatch.watch;
    const invokeUser = getCurrentParticipant();
   
   if (watch.owner.getIdentifier() != invokeUser.getIdentifier() | watch.manufacturer.getIdentifier() != invokeUser.getIdentifier()) {
       throw new Error('Your ID number is not correct. You can not create watches on behalf of other manufacturers');
    }
    
    let ref = watch.ref;
    const regex = /(0)[1-3](ST|PL|GO)/;
    const isExisting = regex.test(ref);
    //var regex = new RegExp(/(0)[1-3](ST|PL|GO)/, 'i');
    if( isExisting == false){
       throw new Error('Please check the watch reference you entered, it does not seems to be correct')
    }
    
    let serialNumber = watch.serialNumber;
    const regex1 = /([0-9]{10})/;
    const isExisting1 = regex1.test(serialNumber);
    //var regex = new RegExp(/(0)[1-3](ST|PL|GO)/, 'i');
    if( isExisting1 == false){
       throw new Error('Please check the watch serialNumber you entered, it does not seems to be correct')
    }
    
    const watchRegistry = await getAssetRegistry('org.watchain.firstHand.Watch');
    await watchRegistry.add(watch);
  }

  
/**
 * Make an Order for a new Watch
 * @param {org.watchain.firstHand.CreateOrder} createOrder - the order
 * @transaction
 */
async function createOrder(createOrder) {  // eslint-disable-line no-unused-vars

    let order = createOrder.order;
    if (order.watch.status != 'NEW') {
        throw new Error('Watch not available to purchase from manufacturer');
    }
  
    const invokeUser = getCurrentParticipant();
    if (order.orderer.getIdentifier() != invokeUser.getIdentifier()) {
        throw new Error('Your ID number is not correct. You can not place orders on behalf of other collectors');
    }
    
    let cost = order.watch.retailPrice;
    if(cost > invokeUser.balance) {
         throw new Error('The cost of this watch exceeds your current balance.');
    }
    invokeUser.freezeBalance += cost;
    invokeUser.balance -= cost;

    const collectorRegistry = await getParticipantRegistry('org.watchain.users.Collector');
    await collectorRegistry.update(invokeUser);


    // save the new order
    const orderRegistry = await getAssetRegistry('org.watchain.firstHand.Order');
    await orderRegistry.add(order);
  
  	//update watch status
    let watch = order.watch;
    watch.status = 'ORDERED';
    let watchRegistry = await getAssetRegistry('org.watchain.firstHand.Watch');
    await watchRegistry.update(watch);
}

/**
 * Update order status
 * @param {org.watchain.firstHand.UpdateOrder} updateOrder - the order
 * @transaction
 */

 async function updateOrder (updateOrder) {

     let order = updateOrder.order;
     const invokeUser = getCurrentParticipant();

     if (order.watch.status != 'READY'|'ON_DELIVERY'){
         if (invokeUser.getIdentifier() == 'org.watchain.users.Courier.*'){
             throw new Error ('Courier can not update the status of an order it did not receive')
         }
    }
    if (order.watch.status != 'DELIVERED') {
        if (invokeUser.getIdentifier() == 'org.watchain.users.Collector.*'){
            throw new Error ('Collector can not update the status of an order it did not receive')
        }
    }

    //save  new value of the asset and update order status with the new value
    let newStatus = updateOrder.orderStatus;
    order.status = newStatus;

    //Get asset registry for the order and Update the order in the assetregistry
    let orderRegistry = getAssetRegistry('org.watchain.firstHand.Order');
    await orderRegistry.update(order);

    //Emit an event for the updated order status
    //let event = getFactory().newEvent('org.watchain.firstHand', '')

    //let NS = 'org.watchain.firstHand.Watch'
    if (order.status == 'PAID') {
        order.watch.owner = order.orderer;
    }
    order.status = 'OWNER_ASSIGNED'
    // Update the order in the assetregistry
    await orderRegistry.update(order);
 }




/**
 * Report theft for a watch you own
 * @param {org.watchain.firstHand.ReportTheft} reportTheft - the theft
 * @transaction
 */
async function reportTheft(reportTheft) {  // eslint-disable-line no-unused-vars

    let watch = reportTheft.watch;
    const invokeUser = getCurrentParticipant();
    if (watch.owner.getIdentifier() != invokeUser.getIdentifier()) {
        throw new Error ('You are not allowed to report theft for a watch you do not own, its owner should report the theft')
    }

    watch.status = 'STOLEN'
    let watchRegistry = await getAssetRegistry('org.watchain.firstHand.Watch');
    await watchRegistry.update(watch);
}

/**
 * Report theft for a watch you own
 * @param {org.watchain.firstHand.RecoverTheft} recoverTheft - the theft
 * @transaction
 */
async function recoverTheft(recoverTheft) {  // eslint-disable-line no-unused-vars

    let watch = recoverTheft.watch;
    const invokeUser = getCurrentParticipant();
    if (watch.status != 'STOLEN') {
        throw new Error (' cannot recover a watch that is not recorded as stolen')
    }
    if (watch.owner.getIdentifier() != invokeUser.getIdentifier()) {
        throw new Error ('You are not allowed to report theft for a watch you do not own, its owner should report the theft')
    }

    watch.status = 'RECOVERED'
    let watchRegistry = await getAssetRegistry('org.watchain.firstHand.Watch');
    await watchRegistry.update(watch);
}