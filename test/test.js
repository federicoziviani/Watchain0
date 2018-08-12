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

'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');
const path = require('path');

const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

//const namespaceUsers = 'org.watchain.users';
const namespace = 'org.watchain.firstHand';
const assetType = 'Watch';
const orderType = 'Order';
const contractType = 'Contract';
const orderNS = namespace + '.' + orderType;
const assetNS = namespace + '.' + assetType;
const contractNS = namespace + '.' + contractType;
const participantM = namespace + '.' + 'Manufacturer';
const participantCol = namespace + '.' + 'Collector';
const participantCou = namespace + '.' + 'Courier';
const participantI = namespace + '.' + 'Insurer';
const participantA = namespace + '.' + 'Auctioneer';
const participantF = namespace + '.' + 'Fca';
//const participantType3 = 'Courier';
//const participantType4 = 'Auctioneer';
//const participantType5 = 'Insurer';
//const participantM = namespace + '.' + participantM;

describe('Create Watch', () => {
    // In-memory card store for testing so cards are not persisted to the file system
    const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } );

    // Embedded connection used for local testing
    const connectionProfile = {
        name: 'embedded',
        'x-type': 'embedded'
    };

    // Name of the business network card containing the administrative identity for the business network
    const adminCardName = 'admin';

    // Admin connection to the blockchain, used to deploy the business network
    let adminConnection;

    // This is the business network connection the tests will use.
    let businessNetworkConnection;

    // This is the factory for creating instances of types.
    let factory;

    // These are the identities for our participants.
    const orisCardName = 'oris';
    const fedeCardName = 'fede';
    const dhlCardName = 'dhl';
    const allianzCardName = 'allianz';
    const sothebysCardName = 'sothebys';
    const fcaCardName = 'fca';
    

    // These are a list of receieved events.
    let events;

    let businessNetworkName;

    before(async () => {
        // Generate certificates for use with the embedded connection
        const credentials = CertificateUtil.generate({ commonName: 'admin' });

        // Identity used with the admin connection to deploy business networks
        const deployerMetadata = {
            version: 1,
            userName: 'PeerAdmin',
            roles: [ 'PeerAdmin', 'ChannelAdmin' ]
        };
        const deployerCard = new IdCard(deployerMetadata, connectionProfile);
        deployerCard.setCredentials(credentials);
        const deployerCardName = 'PeerAdmin';

        adminConnection = new AdminConnection({ cardStore: cardStore });

        await adminConnection.importCard(deployerCardName, deployerCard);
        await adminConnection.connect(deployerCardName);
    });

    /**
     *
     * @param {String} cardName The card name to use for this identity
     * @param {Object} identity The identity details
     */
    async function importCardForIdentity(cardName, identity) {
        const metadata = {
            userName: identity.userID,
            version: 1,
            enrollmentSecret: identity.userSecret,
            businessNetwork: businessNetworkName
        };
        const card = new IdCard(metadata, connectionProfile);
        await adminConnection.importCard(cardName, card);
    }

    // This is called before each test is executed.
    beforeEach(async () => {
        // Generate a business network definition from the project directory.
        let businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));
        businessNetworkName = businessNetworkDefinition.getName();
        await adminConnection.install(businessNetworkDefinition);
        const startOptions = {
            networkAdmins: [
                {
                    userName: 'admin',
                    enrollmentSecret: 'adminpw'
                }
            ]
        };
        const adminCards = await adminConnection.start(businessNetworkName, businessNetworkDefinition.getVersion(), startOptions);
        await adminConnection.importCard(adminCardName, adminCards.get('admin'));

        // Create and establish a business network connection
        businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });
        events = [];
        businessNetworkConnection.on('event', event => {
            events.push(event);
        });
        await businessNetworkConnection.connect(adminCardName);

        // Get the factory for the business network.
        factory = businessNetworkConnection.getBusinessNetwork().getFactory();

        //get the participant registry for manufacturer
        const manufacturerRegistry = await businessNetworkConnection.getParticipantRegistry(participantM);
        // Create the participants.
        const oris = factory.newResource(namespace, 'Manufacturer', 'oris');
        oris.availableBalance = 0.0;
        await manufacturerRegistry.add(oris);

        //get the participant registry for collector
        const collectorRegistry = await businessNetworkConnection.getParticipantRegistry(participantCol);
        // Create the participants.
        const fede = factory.newResource(namespace, 'Collector', 'fede');
        fede.availableBalance = 9000.0;
        await collectorRegistry.add(fede);

        //get the participant registry for courier
        const courierRegistry = await businessNetworkConnection.getParticipantRegistry(participantCou);
        // Create the participants.
        const dhl = factory.newResource(namespace, 'Courier', 'dhl');
        //dhl.availableBalance = 0.0;
        await courierRegistry.add(dhl);

        //get the participant registry for insurer
        const insurerRegistry = await businessNetworkConnection.getParticipantRegistry(participantI);
        // Create the participants.
        const allianz = factory.newResource(namespace, 'Insurer', 'allianz');
        //dhl.availableBalance = 0.0;
        await insurerRegistry.add(allianz);

        //get the participant registry for auctioneer
        const auctioneerRegistry = await businessNetworkConnection.getParticipantRegistry(participantA);
        // Create the participants.
        const sothebys = factory.newResource(namespace, 'Auctioneer', 'sothebys');
        //dhl.availableBalance = 0.0;
        await auctioneerRegistry.add(sothebys);

        //get the participant registry for FCA
        const fcaRegistry = await businessNetworkConnection.getParticipantRegistry(participantF);
        // Create the participants.
        const fca = factory.newResource(namespace, 'Fca', 'fca');
        //dhl.availableBalance = 0.0;
        await fcaRegistry.add(fca);

        //get asset registry for watches
        const watchRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        //Create the assets owned by manufacturer.
        const watch0 = factory.newResource(namespace, assetType, '0000000000');
        watch0.owner = factory.newRelationship(namespace, 'Manufacturer' , 'oris');
        watch0.ref = '01ST';
        watch0.status = 'NEW';
        watch0.retailPrice = 500;
        watch0.manufacturer = factory.newRelationship(namespace, 'Manufacturer', 'oris');
        // Add the asset.
        await watchRegistry.add(watch0);

        //get asset registry for watches
        await businessNetworkConnection.getAssetRegistry(assetNS);
        //Create the assets owned by manufacturer.
        const watch1 = factory.newResource(namespace, assetType, '0000000001');
        watch1.owner = factory.newRelationship(namespace, 'Manufacturer' , 'oris');
        watch1.ref = '01ST';
        watch1.status = 'NEW';
        watch1.retailPrice = 500;
        watch1.manufacturer = factory.newRelationship(namespace, 'Manufacturer', 'oris');
        // Add the asset.
        await watchRegistry.add(watch1);

        //get asset registry for watches
        await businessNetworkConnection.getAssetRegistry(assetNS);
        //Create the assets owned by manufacturer.
        const watch3 = factory.newResource(namespace, assetType, '0000000003');
        watch3.owner = factory.newRelationship(namespace, 'Manufacturer' , 'oris');
        watch3.ref = '01ST';
        watch3.status = 'NEW';
        watch3.retailPrice = 500;
        watch3.manufacturer = factory.newRelationship(namespace, 'Manufacturer', 'oris');
        // Add the asset.
        await watchRegistry.add(watch3);

        //get asset registry for watches
        await businessNetworkConnection.getAssetRegistry(assetNS);
        //Create the assets owned by manufacturer.
        const watch4 = factory.newResource(namespace, assetType, '0000000004');
        watch4.owner = factory.newRelationship(namespace, 'Manufacturer' , 'oris');
        watch4.ref = '01ST';
        watch4.status = 'NEW';
        watch4.retailPrice = 500;
        watch4.manufacturer = factory.newRelationship(namespace, 'Manufacturer', 'oris');
        // Add the asset.
        await watchRegistry.add(watch4);

        //get asset registry for watches
        await businessNetworkConnection.getAssetRegistry(assetNS);
        //Create the assets owned by manufacturer.
        const watch5 = factory.newResource(namespace, assetType, '0000000005');
        watch5.owner = factory.newRelationship(namespace, 'Manufacturer' , 'oris');
        watch5.ref = '01ST';
        watch5.status = 'NEW';
        watch5.retailPrice = 500;
        watch5.manufacturer = factory.newRelationship(namespace, 'Manufacturer', 'oris');
        // Add the asset.
        await watchRegistry.add(watch5);

        //get asset registry for watches
        await businessNetworkConnection.getAssetRegistry(assetNS);
        //Create the assets owned by manufacturer.
        const watch6 = factory.newResource(namespace, assetType, '0000000006');
        watch6.owner = factory.newRelationship(namespace, 'Manufacturer' , 'oris');
        watch6.ref = '01ST';
        watch6.status = 'NEW';
        watch6.retailPrice = 500;
        watch6.manufacturer = factory.newRelationship(namespace, 'Manufacturer', 'oris');
        // Add the asset.
        await watchRegistry.add(watch6);

        //get asset registry for watches
        await businessNetworkConnection.getAssetRegistry(assetNS);
        //Create the assets owned by manufacturer.
        const watch7 = factory.newResource(namespace, assetType, '0000000007');
        watch7.owner = factory.newRelationship(namespace, 'Manufacturer' , 'oris');
        watch7.ref = '01ST';
        watch7.status = 'NEW';
        watch7.retailPrice = 500;
        watch7.manufacturer = factory.newRelationship(namespace, 'Manufacturer', 'oris');
        // Add the asset.
        await watchRegistry.add(watch7);

        //get asset registry for watches
        await businessNetworkConnection.getAssetRegistry(assetNS);
        //Create the assets owned by manufacturer.
        const watch8 = factory.newResource(namespace, assetType, '0000000008');
        watch8.owner = factory.newRelationship(namespace, 'Manufacturer' , 'oris');
        watch8.ref = '01ST';
        watch8.status = 'NEW';
        watch8.retailPrice = 500;
        watch8.manufacturer = factory.newRelationship(namespace, 'Manufacturer', 'oris');
        // Add the asset.
        await watchRegistry.add(watch8);

        //get asset registry for watches
        await businessNetworkConnection.getAssetRegistry(assetNS);
        //Create the assets owned by manufacturer.
        const watch9 = factory.newResource(namespace, assetType, '0000000009');
        watch9.owner = factory.newRelationship(namespace, 'Manufacturer' , 'oris');
        watch9.ref = '01ST';
        watch9.status = 'NEW';
        watch9.retailPrice = 500;
        watch9.manufacturer = factory.newRelationship(namespace, 'Manufacturer', 'oris');
        // Add the asset.
        await watchRegistry.add(watch9);

        //get asset registry for watches
        await businessNetworkConnection.getAssetRegistry(assetNS);
        //Create the assets owned by manufacturer.
        const watch10 = factory.newResource(namespace, assetType, '0000000010');
        watch10.owner = factory.newRelationship(namespace, 'Manufacturer' , 'oris');
        watch10.ref = '01ST';
        watch10.status = 'NEW';
        watch10.retailPrice = 500;
        watch10.manufacturer = factory.newRelationship(namespace, 'Manufacturer', 'oris');
        // Add the asset.
        await watchRegistry.add(watch10);


        //get asset registry for orders
        const orderRegistry = await businessNetworkConnection.getAssetRegistry(orderNS);
        //create the order asset
        let order0 = factory.newResource(namespace, 'Order', '0' );
        order0.watch = factory.newRelationship(namespace, 'Watch', '0000000000');
        order0.orderer = factory.newRelationship(namespace, 'Collector', 'fede' );
        order0.orderStatus = 'SUBMITTED';
        // Add the asset.
        await orderRegistry.add(order0);

        //get asset registry for orders
        await businessNetworkConnection.getAssetRegistry(orderNS);
        //create the order asset
        let order4 = factory.newResource(namespace, 'Order', '4' );
        order4.watch = factory.newRelationship(namespace, 'Watch', '0000000005');
        order4.orderer = factory.newRelationship(namespace, 'Collector', 'fede' );
        order4.orderStatus = 'ACCEPTED';
        // Add the asset.
        await orderRegistry.add(order4);

        //get asset registry for orders
        await businessNetworkConnection.getAssetRegistry(orderNS);
        //create the order asset
        let order5 = factory.newResource(namespace, 'Order', '5' );
        order5.watch = factory.newRelationship(namespace, 'Watch', '0000000006');
        order5.orderer = factory.newRelationship(namespace, 'Collector', 'fede' );
        order5.orderStatus = 'READY';
        // Add the asset.
        await orderRegistry.add(order5);

        //get asset registry for orders
        await businessNetworkConnection.getAssetRegistry(orderNS);
        //create the order asset
        let order6 = factory.newResource(namespace, 'Order', '6' );
        order6.watch = factory.newRelationship(namespace, 'Watch', '0000000007');
        order6.orderer = factory.newRelationship(namespace, 'Collector', 'fede' );
        order6.orderStatus = 'ON_DELIVERY';
        // Add the asset.
        await orderRegistry.add(order6);

        //get asset registry for orders
        await businessNetworkConnection.getAssetRegistry(orderNS);
        //create the order asset
        let order7 = factory.newResource(namespace, 'Order', '7' );
        order7.watch = factory.newRelationship(namespace, 'Watch', '0000000008');
        order7.orderer = factory.newRelationship(namespace, 'Collector', 'fede' );
        order7.orderStatus = 'DELIVERED';
        // Add the asset.
        await orderRegistry.add(order7);

        //get asset registry for orders
        await businessNetworkConnection.getAssetRegistry(orderNS);
        //create the order asset
        let order8 = factory.newResource(namespace, 'Order', '8' );
        order8.watch = factory.newRelationship(namespace, 'Watch', '0000000009');
        order8.orderer = factory.newRelationship(namespace, 'Collector', 'fede' );
        order8.orderStatus = 'RECEIVED';
        // Add the asset.
        await orderRegistry.add(order8);

        //get asset registry for orders
        await businessNetworkConnection.getAssetRegistry(orderNS);
        //create the order asset
        let order9 = factory.newResource(namespace, 'Order', '9' );
        order9.watch = factory.newRelationship(namespace, 'Watch', '0000000010');
        order9.orderer = factory.newRelationship(namespace, 'Collector', 'fede' );
        order9.orderStatus = 'PAID';
        // Add the asset.
        await orderRegistry.add(order9);



        // Issue the identitity for manufacturer
        let identity = await businessNetworkConnection.issueIdentity(participantM + '#oris', 'oris1');
        await importCardForIdentity(orisCardName, identity);
        // Issue the identity for collector
        identity = await businessNetworkConnection.issueIdentity(participantCol + '#fede', 'fede1');
        await importCardForIdentity(fedeCardName, identity);
        // Issue the identity for courier
        identity = await businessNetworkConnection.issueIdentity(participantCou + '#dhl', 'dhl1');
        await importCardForIdentity(dhlCardName, identity);
        // Issue the identity for insurer
        identity = await businessNetworkConnection.issueIdentity(participantI + '#allianz', 'allianz1');
        await importCardForIdentity(allianzCardName, identity);
        // Issue the identity for auctioneer
        identity = await businessNetworkConnection.issueIdentity(participantA + '#sothebys', 'sothebys1');
        await importCardForIdentity(sothebysCardName, identity);
        // Issue the identity for fca
        identity = await businessNetworkConnection.issueIdentity(participantF + '#fca', 'fca1');
        await importCardForIdentity(fcaCardName, identity);
    });

    /**
     * Reconnect using a different identity.
     * @param {String} cardName The name of the card for the identity to use
     */
    async function useIdentity(cardName) {
        await businessNetworkConnection.disconnect();
        businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });
        events = [];
        businessNetworkConnection.on('event', (event) => {
            events.push(event);
        });
        await businessNetworkConnection.connect(cardName);
        factory = businessNetworkConnection.getBusinessNetwork().getFactory();
    }
    
    it('Manufacturer can add assets that he owns', async () => {
        // Use the identity for the manufacturer Oris.
        await useIdentity(orisCardName);

        // Create the asset.
        let watch2 = factory.newResource(namespace, assetType, '0000000002');
        watch2.owner = factory.newRelationship(namespace, 'Manufacturer', 'oris');
        watch2.ref = '01ST';
        watch2.status = 'NEW';
        watch2.retailPrice = 500;
        watch2.manufacturer = factory.newRelationship(namespace, 'Manufacturer', 'oris');


        // Add the asset, then get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        await assetRegistry.add(watch2);

        // Validate the asset.
        watch2 = await assetRegistry.get('0000000002');
        watch2.owner.getFullyQualifiedIdentifier().should.equal(participantM + '#oris');
        watch2.ref.should.equal('01ST');
        watch2.status.should.equal('NEW');
        watch2.retailPrice.should.equal(500);
        watch2.manufacturer.getFullyQualifiedIdentifier().should.equal(participantM + '#oris');
    });

    it('Collector can order a new watch', async () =>{
        //use identity for the collector Fede.
        await useIdentity(fedeCardName);

        //create the new order asset
        let order1 = factory.newResource(namespace, 'Order', '1' );
        order1.watch = factory.newRelationship(namespace, 'Watch', '0000000001');
        order1.orderer = factory.newRelationship(namespace, 'Collector', 'fede' );
        order1.orderStatus = 'SUBMITTED';

        //save the order asset
        const orderRegistry = await businessNetworkConnection.getAssetRegistry(orderNS);
        await orderRegistry.add(order1);

        //update the watch status
        let watch1 = factory.newResource(namespace, 'Watch', '0000000001');
        watch1.owner = factory.newRelationship(namespace, 'Manufacturer', 'oris');
        watch1.ref = '01ST';
        watch1.retailPrice = 500;
        watch1.manufacturer = factory.newRelationship(namespace, 'Manufacturer', 'oris');
        watch1.status = 'ORDERED';

        //save the watch status update
        const watchRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        await watchRegistry.update(watch1);

        const collectorRegistry = await businessNetworkConnection.getParticipantRegistry(participantCol);
        //update the collector balance
        const fede = factory.newResource(namespace, 'Collector', 'fede');
        fede.availableBalance = 9000.0;
        fede.availableBalance -= watch1.retailPrice;
        fede.frozenBalance += watch1.retailPrice;

        //save the collector update
        await businessNetworkConnection.getParticipantRegistry(participantCol);
        await collectorRegistry.update(fede);
       
        //get the order asset
        await businessNetworkConnection.getAssetRegistry(orderNS);
        order1 = await orderRegistry.get('1');
        //get the watch asset
        await businessNetworkConnection.getAssetRegistry(assetNS);
        watch1 = await watchRegistry.get('0000000001');
        // get the collector participant
        await businessNetworkConnection.getParticipantRegistry(participantCol);
        await collectorRegistry.get('fede');

    });

    /**it('Collector can submit a create order transaction', async() =>{
        // Use the identity for the manufacturer Oris.
        await useIdentity(fedeCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'CreateOrder');
        //let order3 = transaction.order;
        transaction.order = factory.newResource(namespace, 'Order', '3' );
        transaction.order.watch = factory.newRelationship(namespace, 'Watch', '0000000003');
        transaction.order.orderer = factory.newRelationship(namespace, 'Collector', 'fede' );
        transaction.order.orderStatus = 'SUBMITTED';
        //transaction.order.orderStatus = transaction.orderStatus;
        await businessNetworkConnection.submitTransaction(transaction);
 
        // Get the asset.
        const orderRegistry = await businessNetworkConnection.getAssetRegistry(orderNS);
        await orderRegistry.get('3');

        //validate the asset
        //order3.orderStatus.should.equal('SUBMITTED');
    });*/

    it('Manufacturer can accept an order', async() =>{
        // Use the identity for the manufacturer Oris.
        await useIdentity(orisCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'AcceptOrder');
        transaction.order = factory.newRelationship(namespace, 'Order', '0');
        transaction.orderStatus = 'ACCEPTED';
        //transaction.order.orderStatus = transaction.orderStatus;
        await businessNetworkConnection.submitTransaction(transaction);
 
        // Get the asset.
        const orderRegistry = await businessNetworkConnection.getAssetRegistry(orderNS);
        const order0 = await orderRegistry.get('0');

        //validate the asset
        order0.orderStatus.should.equal('ACCEPTED');
    });

    it('Manufacturer can mark an ready for delivery', async() =>{
        // Use the identity for the manufacturer Oris.
        await useIdentity(orisCardName);

        const transaction = factory.newTransaction(namespace, 'OrderReady');
        transaction.order = factory.newRelationship(namespace, 'Order', '4');
        transaction.orderStatus = 'READY';
        //transaction.order.orderStatus = transaction.orderStatus;
        await businessNetworkConnection.submitTransaction(transaction);
 
        // Get the asset.
        const orderRegistry = await businessNetworkConnection.getAssetRegistry(orderNS);
        const order4 = await orderRegistry.get('4');

        //validate the asset
        order4.orderStatus.should.equal('READY');
    });

    it('Courier can create a contract that assigns him deliver an order', async()=>{
        //use identity for the courier dhl.
        await useIdentity(dhlCardName);

        // Add the new contract asset.
        const contract1 = factory.newResource(namespace, 'Contract', '1');
        contract1.order = factory.newRelationship(namespace, 'Order', '5');
        contract1.courier = factory.newRelationship(namespace, 'Courier', 'dhl');

        // save the new contract asset.
        const contractRegistry = await businessNetworkConnection.getAssetRegistry(contractNS);
        await contractRegistry.add(contract1);

        //Update the order status
        let order5 = factory.newResource(namespace, 'Order', '5');
        order5.watch = factory.newRelationship(namespace, 'Watch', '0000000006');
        order5.orderer = factory.newRelationship(namespace, 'Collector', 'fede' );
        order5.orderStatus = 'ON_DELIVERY';
        order5.courierAssigned = true;

        //save the order status update
        const orderRegistry = await businessNetworkConnection.getAssetRegistry(orderNS);
        await orderRegistry.update(order5);

        // Get the contract asset
        await businessNetworkConnection.getAssetRegistry(contractNS);
        await contractRegistry.get('1');

        // Get the order asset.
        await businessNetworkConnection.getAssetRegistry(orderNS);
        await orderRegistry.get('5');

        //validate the order asset
        order5.orderStatus.should.equal('ON_DELIVERY');
        order5.courierAssigned.should.equal(true);

    });

   /**  it('Collector can not order a watch that have already been ordered', async() =>{
        //use identity for the collector Fede.
        await useIdentity(fedeCardName);

        //create the order asset
        let order2 = factory.newResource(namespace, 'Order', '1' );
        order2.watch = factory.newRelationship(namespace, 'Watch', '0000000000');
        order2.orderer = factory.newRelationship(namespace, 'Collector', 'fede' );
        order2.orderStatus = 'SUBMITTED';

        // Try to add the order asset, should fail.
        const orderRegistry = await businessNetworkConnection.getAssetRegistry(orderNS);
        await orderRegistry.add(order2).should.be.rejectedWith(/Sorry, this watch with serial number 0000000000 has already been ordered/);
    });



        /**  it('Collector can order a new watch', async () =>{
        //use identity for the collector Fede.
        await useIdentity(fedeCardName);

        //create the order asset
        const orderTransaction = factory.newTransaction(namespace, 'CreateOrder');
        let order1 = orderTransaction.order;
        order1 = factory.newResource(namespace, 'Order', '1' );
        let watch1 = order1.watch;
        watch1 = factory.newRelationship(namespace, 'Watch', '0000000001');
        order1.orderer = factory.newRelationship(namespace, 'Collector', 'fede' );
        order1.orderStatus =  'SUBMITTED';
        watch1.status = 'ORDERED';

         //submit the transaction
         await businessNetworkConnection.submitTransaction(orderTransaction);
        //add the order 
        const orderRegistry = await businessNetworkConnection.getAssetRegistry(orderNS);
        await orderRegistry.add(order1);
        //update the watch status
        const watchRegistry = await businessNetworkConnection.getAssetRegistry(orderNS);
        await watchRegistry.update(watch1);
       

        //get the watch and order assets
        orderRegistry = await businessNetworkConnection.getAssetRegistry(orderNS);
        order1 = await orderRegistry.get('1');
        watchRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        watch1 = await watchRegistry.get('0000000001');
    });
         * 
         * 
         * 
         * 
         * it('Manufacturer can submit a transaction to  create a watch', async () => {
        // Use the identity for Manufacturer.
        await useIdentity(orisCardName);

        // Submit the transaction.
        const genesisTransaction = factory.newTransaction(namespace, 'CreateWatch');

        let watch2 = genesisTransaction.watch;
        //genesisTransaction.watch = factory.newRelationship(namespace, 'Watch', '0000000002');
        watch2 = factory.newResource(namespace, assetType, '0000000002');
        watch2.owner = factory.newRelationship(namespace, 'Manufacturer', 'oris');
        watch2.ref = '01ST';
        watch2.status = 'NEW';
        watch2.retailPrice = 500;
        watch2.manufacturer = factory.newRelationship(namespace, 'Manufacturer', 'oris');

        
        // Add the asset, then get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(assetNS);
        await assetRegistry.add(watch2);
        genesisTransaction.watch = factory.newRelationship(namespace, 'Watch', '0000000002');
        await businessNetworkConnection.submitTransaction(genesisTransaction);

        // Get the asset.
        watch2 = await assetRegistry.get('0000000002');

        // Validate the asset.
        watch2.owner.getFullyQualifiedIdentifier().should.equal(participantM + '#oris');
        watch2.ref.should.equal('01ST');
        watch2.status.should.equal('NEW');
        watch2.retailPrice.should.equal(500);
        watch2.manufacturer.getFullyQualifiedIdentifier().should.equal(participantM + '#oris');
    
    });*/
});