/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getAssetRegistry getParticipantRegistry getCurrentParticipant */

/**
 * Initialize some test assets and participants useful for running a demo.
 * @param {org.watchain.firstHand.Setup} Setup - the Setup transaction
 * @transaction
 */
function setup(Setup) { // eslint-disable-line no-unused-vars
    var factory = getFactory();
    var NS = 'org.watchain.users';
    // create the manufacturer
    var manufacturer = factory.newResource(NS, 'Manufacturer', 'oris');
    manufacturer.accountBalance = 0;
    // create the collector
    var collector = factory.newResource(NS, 'Collector', 'fede');
    collector.accountBalance = 10000;
    // create the courier
    var courier = factory.newResource(NS, 'Courier', 'dhl');
    // create the auctioneer
    var auctioneer = factory.newResource(NS, 'Auctioneer', 'sothebys');
    // create the insurer
    var insurer = factory.newResource(NS, 'Insurer', 'allianz');
}

/**
* Create a new Watch
*@param {org.watchain.firstHand.CreateWatch} CreateWatch - the watch
* @transaction
*/
async function createWatch(CreateWatch) { // eslint-disable-line no-unused-vars
    let watch = CreateWatch.watch;
    const invokeUser = getCurrentParticipant();
    if (watch.owner.getIdentifier() !== invokeUser.getIdentifier() | watch.manufacturer.getIdentifier() !== invokeUser.getIdentifier()) {
        throw new Error('Your ID number is not correct. You can not create watches on behalf of other manufacturers');
    }
    let ref = watch.ref;
    const regex = /(0)[1-3](ST|PL|GO)/;
    const isExisting = regex.test(ref);
    //var regex = new RegExp(/(0)[1-3](ST|PL|GO)/, 'i');
    if( isExisting === false){
        throw new Error('Please check the watch reference you entered, it does not seems to be correct');
    }
    let serialNumber = watch.serialNumber;
    const regex1 = /([0-9]{10})/;
    const isExisting1 = regex1.test(serialNumber);
    //var regex = new RegExp(/(0)[1-3](ST|PL|GO)/, 'i');
    if( isExisting1 === false){
        throw new Error('Please check the watch serialNumber you entered, it does not seems to be correct');
    }
    const watchRegistry = await getAssetRegistry('org.watchain.firstHand.Watch');
    await watchRegistry.add(watch);
    let manufacturer = watch.manufacturer;
    manufacturer.stock += 1;
    manufacturer.totalProduction += 1;
    const manufacturerRegistry = await getParticipantRegistry('org.wachain.users.Manufacturer');
    await manufacturerRegistry.update(manufacturer);
}


/**
 * Make an Order for a new Watch
 * @param {org.watchain.firstHand.CreateOrder} CreateOrder - the order
 * @transaction
 */
async function createOrder(CreateOrder) {  // eslint-disable-line no-unused-vars
    let order = CreateOrder.order;
    if (order.watch.status !== 'NEW') {
        throw new Error('Watch not available to purchase from manufacturer');
    }
    const invokeUser = getCurrentParticipant();
    if (order.orderer.getIdentifier() !== invokeUser.getIdentifier()) {
        throw new Error('Your ID number is not correct. You can not place orders on behalf of other collectors');
    }
    let cost = order.watch.retailPrice;
    if(cost > invokeUser.availableBalance) {
        throw new Error('The cost of this watch exceeds your current balance.');
    }
    order.orderStatus = 'SUBMITTED';
    invokeUser.frozenBalance += cost;
    invokeUser.availableBalance -= cost;
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
 * @param {org.watchain.firstHand.AcceptOrder} AcceptOrder - the order
 * @transaction
 */
async function acceptOrder(AcceptOrder){ // eslint-disable-line no-unused-vars
    let order = AcceptOrder.order;
    if(order.orderStatus !== 'SUBMITTED'){
        throw new Error('You can not mark an order as accepted at the current status. Please make sure the current status of the order is "submitted" ');
    }
    acceptOrder.orderStatus = 'ACCEPTED';
    order.orderStatus = acceptOrder.orderStatus;
    const orderRegistry = await getAssetRegistry('org.watchain.firstHand.Order');
    await orderRegistry.update(order);
}


/**
 * Update order status
 * @param {org.watchain.firstHand.OrderReady} OrderReady - the order
 * @transaction
 */
async function orderReady (OrderReady) { // eslint-disable-line no-unused-vars
    let order = OrderReady.order;
    //const invokeUser = getCurrentParticipant();
    if (order.orderStatus !== 'ACCEPTED'){
        throw new Error ('You are not allowed to mark this order ready, you first need to accept this order before marking it ready');
    }
    //save  new value of the asset and update order status with the new value
    orderReady.orderStatus = 'READY';
    order.orderStatus = orderReady.orderStatus;
    //Get asset registry for the order and Update the order in the assetregistry
    const orderRegistry = await getAssetRegistry('org.watchain.firstHand.Order');
    await orderRegistry.update(order);
    //Emit an event for the updated order status
    //let event = getFactory().newEvent('org.watchain.firstHand', '')
    //let NS = 'org.watchain.firstHand.Watch'
    //if (order.orderStatus == 'PAID') {
    //    order.watch.owner = order.orderer;
    //    order.orderStatus = 'OWNER_ASSIGNED'
    // Update the order in the assetregistry
     //   await orderRegistry.update(order);
    //}
}

/**
 * Create a new delivery contract
 * @param {org.watchain.firstHand.CreateContract} CreateContract - the delivery contract
 * @transaction
 */
async function createContract(CreateContract){ // eslint-disable-line no-unused-vars
    let contract = CreateContract.contract;
    if(contract.order.courierAssigned === true){
        throw new Error ('Sorry, a courier has already been assigned to deliver this order');
    }
  //const invokeUser = getCurrentParticipant().getIdentifier();
//  if (contract.courier.getIdentifier() != invokeUser) {
//    throw new Error ('You did not enter your ID. you can not assign delivieries to other couriers')
//  }
    
    contract.terminated = false;
    const contractRegistry = await getAssetRegistry('org.watchain.firstHand.Contract');
    await contractRegistry.add(contract);
    let order = contract.order;
    order.courierAssigned = true;
    order.contract = contract;
    order.orderStatus = 'ON_DELIVERY';
    const orderRegistry = await getAssetRegistry('org.watchain.firstHand.Order');
    await orderRegistry.update(order);
}


/**
*Confirm the delivery for an ordered watch
*@param {org.watchain.firstHand.Delivered} Delivered - delivey confirmation
*@transaction
*/
async function delivered(Delivered){ // eslint-disable-line no-unused-vars
    let order = Delivered.order;
    if(order.orderStatus !== 'ON_DELIVERY'){
        throw new Error ('You can not mark an order as delivered at the current status. Please make sure the current status of the order is "on delivery" ');
    }
    //we had to comment this out to run cucumber unit testing, becasue the function to invoke user is only available when we are connected to the fabric development servers. Therefore only available when deploying the business network on IBM Cloud. 
    //const invokeUser = getCurrentParticipant().getIdentifier();
    //if(order.courier.getIdentifier() !== invokeUser){
    //    throw new Error ('You are not allowed to mark update order status on behalf of other couriers');
    //}
    order.orderStatus = 'DELIVERED';
    const orderRegistry = await getAssetRegistry('org.watchain.firstHand.Order');
    await orderRegistry.update(order);
}

/**
 * Mark order as received
 * @param {org.watchain.firstHand.Received} Received - the order
 * @transaction
 */
async function received(Received){ // eslint-disable-line no-unused-vars
    let order = Received.order;
    if(order.orderStatus !== 'DELIVERED'){
        throw new Error ('You can not mark an order as received at the current status. Please make sure the current status of the order is "delivered" ');
    }
    const invokeUser = getCurrentParticipant().getIdentifier();
    
    if(order.orderer.getIdentifier() !== invokeUser){
         throw new Error ('Please, check your ID. You are not allowed to update the status of an order you did not place');
    }
    order.orderStatus = 'RECEIVED';
    //update balance and stock level for manufacturer
    let manufacturer = order.watch.owner;
    const watchPrice = order.watch.retailPrice;
    manufacturer.availableBalance += watchPrice;
    manufacturer.stock -= 1;
    manufacturer.sold +=1;
    //reduce the frozen balance of the buyer
    let buyer = order.orderer;
    order.watch.owner = buyer;
    buyer.frozenBalance -= watchPrice;
    //assign the new owner
    order.orderStatus = 'OWNER_ASSIGNED';
    //update the last price of the watch to the price paid
    let watch = order.watch;
    watch.lastPrice = watchPrice;
    //update the status of the watch to private
    watch.status = 'PRIVATE';
    //updateorder, watch and collector form the respective registries.
    const orderRegistry = await getAssetRegistry('org.watchain.firstHand.Order');
    await orderRegistry.update(order);
    const watchRegistry = await getAssetRegistry('org.watchain.firstHand.Watch');
    await watchRegistry.update(watch);
    const collectorRegistry = await getParticipantRegistry('org.watchain.users.Collector');
    await collectorRegistry.update(buyer);
    const manufacturerRegistry = await getParticipantRegistry('org.wachain.users.Manufacturer');
    await manufacturerRegistry.update(manufacturer);
}



/**
 * Report theft for a watch you own
 * @param {org.watchain.firstHand.ReportTheft} ReportTheft - the theft
 * @transaction
 */
async function reportTheft(ReportTheft) {  // eslint-disable-line no-unused-vars
    let watch = ReportTheft.watch;
    const invokeUser = getCurrentParticipant();
    if (watch.owner.getIdentifier() !== invokeUser.getIdentifier()) {
        throw new Error ('You are not allowed to report theft for a watch you do not own, its owner should report the theft');
    }
    watch.status = 'STOLEN';
    let watchRegistry = await getAssetRegistry('org.watchain.firstHand.Watch');
    await watchRegistry.update(watch);
}

/**
 * Report theft for a watch you own
 * @param {org.watchain.firstHand.RecoverTheft} RecoverTheft - the theft
 * @transaction
 */
async function recoverTheft(RecoverTheft) {  // eslint-disable-line no-unused-vars
    let watch = RecoverTheft.watch;
    const invokeUser = getCurrentParticipant();
    if (watch.status !== 'STOLEN') {
        throw new Error (' cannot recover a watch that is not recorded as stolen');
    }
    if (watch.owner.getIdentifier() !== invokeUser.getIdentifier()) {
        throw new Error ('You are not allowed to report theft for a watch you do not own, its owner should report the theft');
    }
    watch.status = 'RECOVERED';
    let watchRegistry = await getAssetRegistry('org.watchain.firstHand.Watch');
    await watchRegistry.update(watch);
}