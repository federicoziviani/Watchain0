/*
* Copyright [2018] [Federico Ziviani]
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* global getAssetRegistry getParticipantRegistry getCurrentParticipant */

/**
 * Close the bidding for a watch listing and choose the
 * highest bid that is over the asking price
 * @param {org.interwatch.watchain.MakeListing} MakeListing - the MakeListing transaction
 * @transaction
 */
async function makeListing(MakeListing) {
    const listing = MakeListing.listing;
    const invokeUser = getCurrentParticipant().getIdentifier()
    if (listing.watch.owner.getIdentifier() !==  invokeUser) {
        throw new Error ('Sorry, you are not allowed to make listings for watches you do not own. Please check that your entered your user ID correctly')
    }
    if (listing.watch.status == "STOLEN") {
        throw new Error ('Sorry, you are not allowed to make listings for a watch currently marked as stolen.')
    }

    const assetRegistry = await getAssetRegistry('org.interwatch.watchain.WatchListing')
    await assetRegistry.add(listing);
}


/**
 * Close the bidding for a watch listing and choose the
 * highest bid that is over the asking price
 * @param {org.interwatch.watchain.TerminateBidding} TerminateBidding - the TerminateBidding transaction
 * @transaction
 */
async function terminateBidding(TerminateBidding) {  // eslint-disable-line no-unused-vars
    const listing = TerminateBidding.listing;
    if (listing.state !== 'FOR_SALE') {
        throw new Error('Listing is not FOR SALE');
    }
    //by default we mark the listing as RESERVE_NOT_MET
    listing.state = 'RESERVE_NOT_MET';
    let highestOffer = null;
    let buyer = null;
    let seller = null;
    if (listing.offers && listing.offers.length > 0) {
        // sort the bids by bidPrice
        listing.offers.sort(function(a, b) {
            return (b.bidPrice - a.bidPrice);
        });
        highestOffer = listing.offers[0];
        //for(i=0; i <= highestOffer.lenght(); i++ ){
            //listing.offers.collector.frozenBalance -= listing.offers;
          //  listing.offers.collector.availableBalance += listing.offers;
       // }
        if (highestOffer.bidPrice >= listing.reservePrice) {
            // mark the listing as SOLD
            listing.state = 'SOLD';
            buyer = highestOffer.collector;
            seller = listing.watch.owner;
            // update the availableBalance of the seller
            seller.availableBalance += highestOffer.bidPrice;
            // update the availableBalance of the buyer
            buyer.availableBalance -= highestOffer.bidPrice;
            // transfer the watch to the buyer
            listing.watch.owner = buyer;
            //record the transfer price as market price
            listing.watch.lastPrice = highestOffer.bidPrice;
            // clear the offers
            listing.offers = null;
        } else {
             listing.state = 'RESERVE_NOT_MET'
        }
    }

    if (highestOffer) {
        // save the watch
        const watchRegistry = await getAssetRegistry('org.interwatch.watchain.Watch');
        await watchRegistry.update(listing.watch);
    }

    // save the watch listing
    const watchListingRegistry = await getAssetRegistry('org.interwatch.watchain.WatchListing');
    await watchListingRegistry.update(listing);

    if (listing.state === 'SOLD') {
        
        // save the buyer
        const userRegistry = await getParticipantRegistry('org.interwatch.watchain.Collector');
        await userRegistry.updateAll([buyer, seller]);
    }
}

/**
 * Make an Offer for a WatchListing
 * @param {org.interwatch.watchain.Offer} offer - the offer
 * @transaction
 */
async function Offer(offer) {  // eslint-disable-line no-unused-vars
    let listing = offer.listing;
    if (listing.state !== 'FOR_SALE') {
        throw new Error('Listing is not FOR SALE');
    }

    let collector = offer.collector;
    if (offer.bidPrice > collector.availableBalance){
        throw new Error('Sorry, you do not have enough funds to bid this amount')
    }
    //collector.frozenBalance += offer.bidPrice
    // collector.frozenBalance -= offer.bidPrice
    if (!listing.offers) {
        listing.offers = [];
    }
    listing.offers.push(offer);
    
    // save the offer
    const watchListingRegistry = await getAssetRegistry('org.interwatch.watchain.WatchListing');
    await watchListingRegistry.update(listing);
    // update collector's balance
   // const collectorRegistry = await getParticipantRegistry('org.interwatch.watchain.Collector');
   // await collectorRegistry.update(collector);
}