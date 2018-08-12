# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


# Watch trade network

> This is an interactive, distributed, watch trade demo. It is an omichannel distributed marketplace where both the first and second-hand sales of timepieces are conducted. 
- The first-hand watches can be purchased by collectors who place orders directly  to manufacturer, without the need for any middle man. 
- Second-hand purchases and sales are enabled for the "blockchain proof" watches that have been previously added in the network, by the manufacturer. The second-hand sales take place through auction. Once again without the need for any mddle man to match bid and offer as well as guaranteeing trust between the parties.
- A courier is also involved in both first and second hand transactions having the joint authority, shared with the collector and the manufacturer, to update the delivery status of the phisical items. Once approved the pasyment will be credited to the seller's wallet, the courier paid and the ownership changed. 

This business network defines:

**Participants:**
`Manufacturer` `Auctioneer` `Collector` `Courier` `Insurer` `FCA`

**Assets:**
`Watch` `WatchListing` `Order` `Contract` 

**Transactions:**
<<<<<<< HEAD
`Offer` `TerminateBidding` `CreateWatch` `MakeOrder` `ReportTheft` `TerminateBidding` `Delivery` `DeliveryReceived` `MakeListing`

The `makeOffer` function is called when an `Offer` transaction is submitted. The logic simply checks that the listing for the offer is still for sale, and then adds the offer to the listing, and then updates the offers in the `WatchListing` asset registry.

The `TerminateBidding` function is called when a `TerminateBidding` transaction is submitted for processing. The logic checks that the listing is still for sale, sorts the offers by bid price, and then if the reserve has been met, transfers the ownership of the vehicle associated with the listing to the highest bidder. Money is transferred from the buyer's account to the seller's account, and then all the modified assets are updated in their respective registries.

To test this Business Network Definition in the **Test** tab:

In the `Auctioneer` participant registry, create a new participant.

```
{
  "$class": "org.acme.vehicle.auction.Auctioneer",
  "email": "auction@acme.org",
  "firstName": "Jenny",
  "lastName": "Jones"
}
```

In the `Collector` participant registry, create two participants.

```
{
  "$class": "org.acme.vehicle.auction.Member",
  "balance": 5000,
  "email": "memberA@acme.org",
  "firstName": "Amy",
  "lastName": "Williams"
}
```

```
{
  "$class": "org.acme.vehicle.auction.Member",
  "balance": 5000,
  "email": "memberB@acme.org",
  "firstName": "Billy",
  "lastName": "Thompson"
}
```

In the `Vehicle` asset registry, create a new asset of a vehicle owned by `memberA@acme.org`.

```
{
  "$class": "org.acme.vehicle.auction.Vehicle",
  "vin": "vin:1234",
  "owner": "resource:org.acme.vehicle.auction.Member#memberA@acme.org"
}
```

In the `VehicleListing` asset registry, create a vehicle listing for car `vin:1234`.

```
{
  "$class": "org.acme.vehicle.auction.VehicleListing",
  "listingId": "listingId:ABCD",
  "reservePrice": 3500,
  "description": "Arium Nova",
  "state": "FOR_SALE",
  "vehicle": "resource:org.acme.vehicle.auction.Vehicle#vin:1234"
}
```

You've just listed an Arium Nova for auction, with a reserve price of 3500!

As soon as a `VehicleListing` has been created (and is in the `FOR_SALE` state) participants can submit `Offer` transactions to bid on a vehicle listing.

Submit an `Offer` transaction, by submitting a transaction and selecting `Offer` from the dropdown.

```
{
  "$class": "org.acme.vehicle.auction.Offer",
  "bidPrice": 2000,
  "listing": "resource:org.acme.vehicle.auction.VehicleListing#listingId:ABCD",
  "member": "resource:org.acme.vehicle.auction.Member#memberA@acme.org"
}
```

```
{
  "$class": "org.acme.vehicle.auction.Offer",
  "bidPrice": 3500,
  "listing": "resource:org.acme.vehicle.auction.VehicleListing#listingId:ABCD",
  "member": "resource:org.acme.vehicle.auction.Member#memberB@acme.org"
}
```

To end the auction submit a `CloseBidding` transaction for the listing.

```
{
  "$class": "org.acme.vehicle.auction.CloseBidding",
  "listing": "resource:org.acme.vehicle.auction.VehicleListing#listingId:ABCD"
}
```

This simply indicates that the auction for `listingId:ABCD` is now closed, triggering the `closeBidding` function that was described above.

To see the Vehicle was sold you need to click on the `Vehicle` asset registry to check the owner of the car. The reserve price was met by owner `memberB@acme.org` so you should see the owner of the vehicle is now `memberB@acme.org`.

If you check the state of the VehicleListing with `listingId:ABCD` is should be `SOLD`.

If you click on the `Member` asset registry you can check the balance of each User. You should see that the balance of the buyer `memberB@acme.org` has been debited by `3500`, whilst the balance of the seller `memberA@acme.org` has been credited with `3500`.

Congratulations!

## License <a name="license"></a>
Hyperledger Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Hyperledger Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
=======
`Offer` `TerminateBidding` `CreateWatch` `CreateOrder` `ReportTheft` `RecoverTheft` `TerminateBidding` `Delivered` `Received` `MakeListing` `AcceptOrder` `OrderReady` `CreateContract`  
>>>>>>> 0b3363b9c724e7e0a074ae06d4e1436b8e9e8efa
