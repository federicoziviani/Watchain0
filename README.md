
# The Watchain: a blockchain network to trade luxury watches

> This is an interactive, distributed, watch trade demo. It is an omichannel distributed marketplace where both the first and second-hand sales of timepieces are conducted. 
- The first-hand watches can be purchased by collectors who place orders directly to manufacturers, without the need for any intermediary. 
- Second-hand purchases and sales are enabled for watches that have been previously added in the network, by a manufacturer and purchased by a collctor. The second-hand sales take place through peer to peer auction where the role of Auctioneers is symbolic and reduces to terminating the bidding after a given time. This can be easily automated by a timer and the auctioner completely removed. Authenticity of the watch and purchaser balance are guaranteed in the network, leveraging on blockchain technology.
- A courier is involved in deliverying first-hand orders. Its role can be extended to the second hand deliveries.
- Insurers and Fca are supervising authorities that we have just read access to all resources in the network. No particular function is currently assigned to them. Their presence is necessary to demonstrate the distribution element of blockchain solutions. And the benefits of auditability that it can be provided without compromising security.

This business network defines:

**Participants:**
`Manufacturer` `Auctioneer` `Collector` `Courier` `Insurer` `Fca`

**Assets:**
`Watch` `WatchListing` `Order` `Contract` 

**Transactions:**
`Offer` `TerminateBidding` `CreateWatch` `MakeOrder` `ReportTheft` `TerminateBidding` `Delivery` `DeliveryReceived` `MakeListing` `RecoverTheft` `DeliveryContract` `Received` `OrderReady` `AcceptOrder`

To test the first-hand functionalities of the Watchain, Business Network Definition, in the **Test** tab:

In the `Auctioneer` participant registry, create a new participant.

```
{
  "$class": "org.interwatch.watchain.Auctioneer",
  "userId": "sothebys"
}
```

In the `Collector` participant registry, create two participants.

```
{
  "$class": "org.interwatch.watchain.Collector",
  "availableBalance": 1000,
  "userId": "fede"
}
```

```
{
  "$class": "org.interwatch.watchain.Collector",
  "availableBalance": 1000,
  "userId": "john"
}
```

In the `Courier` participant registry, create a new participant.

```
{
  "$class": "org.interwatch.watchain.Courier",
  "userId": "dhl"
}
```

In the `Fca` participant registry, create a new participant.

```
{
  "$class": "org.interwatch.watchain.Fca",
  "userId": "fca"
}
```

In the `Insurer` participant registry, create a new participant.

```
{
  "$class": "org.interwatch.watchain.Insurer",
  "userId": "allianz"
}
```

In the `Manufacturer` participant registry, create a new participant.

```
{
  "$class": "org.interwatch.watchain.Manufacturer",
  "availableBalance": 500,
  "userId": "oris"
}
```

You have just created the six participant types that will interact with the Watchain network.
To use these newly created identities, it is necessary to install chaincode on each of them. 

In the drop-down menu on the top-right corner select the **ID Registry** tab.
From the **Issue New ID** enter an **ID Name** and connect it to an existing participant. Repeat the process untill you have issued IDs for each participant. 

You've just installed chaincode on each participant, now you can interact with the Watchain, submitting transactions and creating assets, by shifting between participant's identities. 

In the **ID Registry** tab hover over the Manufacturer ID that you just issued and click "use now".
To create a watch in the **test** tab.
From the **Submit Transaction** tab select the `CreateWatch` transaction. Submit the transaction.

```
{
  "$class": "org.interwatch.watchain.CreateWatch",
  "watch": {
    "$class": "org.interwatch.watchain.Watch",
    "serialNumber": "0000000000",
    "ref": "01ST",
    "status": "NEW",
    "retailPrice": 500,
    "manufacturer": "resource:org.interwatch.watchain.Manufacturer#oris",
    "owner": "resource:org.interwatch.watchain.Manufacturer#oris"
  }
}
```

In the **ID Registry** tab hover over the Collector ID corresponding to 'fede' that you just issued and click "use now".
To create an order for a watch in the **test** tab.
From the **Submit Transaction** tab select the `CreateOrder` transaction. Submit the transaction.

```
{
  "$class": "org.interwatch.watchain.CreateOrder",
  "order": {
    "$class": "org.interwatch.watchain.Order",
    "orderId": "01",
    "watch": "resource:org.interwatch.watchain.Watch#0000000000",
    "orderer": "resource:org.interwatch.watchain.Collector#fede",
    "orderStatus": "SUBMITTED"
  }
}
```

In the **ID Registry** tab hover over the Manufacturer ID that you just issued and click "use now".
To accept an order for a watch in the **test** tab.
From the **Submit Transaction** tab select the `AcceptOrder` transaction. Submit the transaction.

```
{
  "$class": "org.interwatch.watchain.AcceptOrder",
  "orderStatus": "ACCEPTED",
  "order": "resource:org.interwatch.watchain.Order#01"
}
```

From the **Submit Transaction** tab select the `OrderReady` transaction. Submit the transaction.

```
{
  "$class": "org.interwatch.watchain.OrderReady",
  "orderStatus": "READY",
  "order": "resource:org.interwatch.watchain.Order#01"
}
```

In the **ID Registry** tab hover over the Courier ID that you just issued and click "use now".
To accept an order for a watch in the **test** tab.
From the **Submit Transaction** tab select the `DeliveryContract` transaction. Submit the transaction.

```
{
  "$class": "org.interwatch.watchain.DeliveryContract",
  "contract": {
    "$class": "org.interwatch.watchain.Contract",
    "contractId": "001",
    "terminated": false,
    "order": "resource:org.interwatch.watchain.Order#01",
    "courier": "resource:org.interwatch.watchain.Courier#dhl"
  }
}
```

From the **Submit Transaction** tab select the `Delivered` transaction. Submit the transaction.

```
{
  "$class": "org.interwatch.watchain.Delivered",
  "order": "resource:org.interwatch.watchain.Order#01"
}
```

In the **ID Registry** tab hover over the Collector ID corresponding to 'fede' that you just issued and click "use now".
To accept an order for a watch in the **test** tab.
From the **Submit Transaction** tab select the `Received` transaction. Submit the transaction.

```
{
  "$class": "org.interwatch.watchain.Received",
  "order": "resource:org.interwatch.watchain.Order#01"
}
```

We have just concluded the first-hand journey of a watch. From its creation by a manufacturer to its purchase by a collector. 
To check that every step produced the expected outcome. 
In the Asset Registry you should see at least the following assets.

A `Contract` with the following properties:
{
  "$class": "org.interwatch.watchain.Contract",
  "contractId": "001",
  "terminated": true,
  "order": "resource:org.interwatch.watchain.Order#01",
  "courier": "resource:org.interwatch.watchain.Courier#dhl"
}

A `Watch` with the following properties: 
{
  "$class": "org.interwatch.watchain.Watch",
  "serialNumber": "0000000000",
  "ref": "01ST",
  "status": "PRIVATE",
  "lastPrice": 500,
  "retailPrice": 500,
  "manufacturer": "resource:org.interwatch.watchain.Manufacturer#oris",
  "owner": "resource:org.interwatch.watchain.Collector#fede"
}

An `Order` with the following properties: 
{
  "$class": "org.interwatch.watchain.Order",
  "orderId": "01",
  "watch": "resource:org.interwatch.watchain.Watch#0000000000",
  "orderer": "resource:org.interwatch.watchain.Collector#fede",
  "contract": {
    "$class": "org.interwatch.watchain.Contract",
    "contractId": "001",
    "terminated": true,
    "order": "resource:org.interwatch.watchain.Order#01",
    "courier": "resource:org.interwatch.watchain.Courier#dhl"
  },
  "orderStatus": "OWNER_ASSIGNED",
  "courierAssigned": true
}

In the Participant Registry you should see at least the following participants.

A `Collector` with the following properties:
{
  "$class": "org.interwatch.watchain.Collector",
  "availableBalance": 500,
  "userId": "fede"
}

A `Manufacturer` with the following properties:
{
  "$class": "org.interwatch.watchain.Manufacturer",
  "availableBalance": 500,
  "userId": "oris"
}

Congratulations! we have successfully tested the first-hand functions of the watchain.

To test the second-hand functionalities of the Watchain, Business Network Definition, in the **Test** tab:

In the **ID Registry** tab hover over the Collector ID corresponding to 'fede' and click "use now".
To start a listing and sell on auction a watch in the **test** tab.
From the **Submit Transaction** tab select the `MakeListing` transaction. Submit the transaction.

```
{
  "$class": "org.interwatch.watchain.MakeListing",
  "listing": {
    "$class": "org.interwatch.watchain.WatchListing",
    "listingId": "myFirstListing",
    "reservePrice": 500,
    "description": "This is the first watch ever created on the Watchain business network",
    "state": "FOR_SALE",
    "watch": "resource:org.interwatch.watchain.Watch#0000000000"
  }
}
```

In the **ID Registry** tab hover over the Collector ID corresponding to 'john' and click "use now".
To start a listing and sell on auction a watch you own in the **test** tab.
From the **Submit Transaction** tab select the `Offer` transaction. Submit the transaction.

```
{
  "$class": "org.interwatch.watchain.Offer",
  "bidPrice": 599,
  "listing": "resource:org.interwatch.watchain.WatchListing#myFirstListing",
  "collector": "resource:org.interwatch.watchain.Collector#john"
}
```

In the **ID Registry** hover over the Auctioneer ID corresponding to 'sothebys' and click "use now".
To start a listing and sell on auction a watch you own in the **test** tab.
From the **Submit Transaction** tab select the `TerminateBidding` transaction. Submit the transaction.

```
{
  "$class": "org.interwatch.watchain.TerminateBidding",
  "listing": "resource:org.interwatch.watchain.WatchListing#myFirstListing"
}
```

We have just concluded a second-hand auction for a watch. Ownership was exchanged for a payment on a peer to peer distributed auction. 
To check that every step produced the expected outcome. 
In the Asset Registry you should see at least the following assets.

A `WatchListing` with the following properties:
{
  "$class": "org.interwatch.watchain.WatchListing",
  "listingId": "myFirstListing",
  "reservePrice": 500,
  "description": "This is the first watch ever created on the Watchain business network",
  "state": "SOLD",
  "watch": "resource:org.interwatch.watchain.Watch#0000000000"
}

A `Watch` with the following properties: 
{
  "$class": "org.interwatch.watchain.Watch",
  "serialNumber": "0000000000",
  "ref": "01ST",
  "status": "PRIVATE",
  "lastPrice": 599,
  "retailPrice": 500,
  "manufacturer": "resource:org.interwatch.watchain.Manufacturer#oris",
  "owner": "resource:org.interwatch.watchain.Collector#john"
}

In the Participant Registry you should see at least the following participants.

Two `Collector` with the following properties:
{
  "$class": "org.interwatch.watchain.Collector",
  "availableBalance": 1099,
  "userId": "fede"
}

{
  "$class": "org.interwatch.watchain.Collector",
  "availableBalance": 401,
  "userId": "john"
}

Congratulations!