# 
#Licensed under the Apache License, Version 2.0 (the "License");
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

Feature: Create Watch 

    Background: 
        Given I have deployed the business network definition ..
        And I have added the following participants of type org.interwatch.watchain.Manufacturer
            | userId | availableBalance | stock | sold | totalProduction |
            | oris   | 500.0            | 10    | 1    | 11              |
        And I have added the following participants of type org.interwatch.watchain.Collector
            | userId | availableBalance |
            | fede   | 9000.0           |
            | john   | 0.0              |
        And I have added the following participants of type org.interwatch.watchain.Courier
            | userId | 
            | dhl    |
        And I have added the following participants of type org.interwatch.watchain.Insurer
            | userId  | 
            | allianz |
        And I have added the following participants of type org.interwatch.watchain.Auctioneer
            | userId   | 
            | sothebys |
        And I have added the following participants of type org.interwatch.watchain.Fca
            | userId | 
            | fca    |
        And I have added the following assets of type org.interwatch.watchain.Watch
            | serialNumber | ref  | status | retailPrice | manufacturer | owner |
            | 0000000000   | 01ST | NEW    | 500         | oris         | oris  | 
            | 0000000001   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000003   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000004   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000005   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000006   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000007   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000008   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000009   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000010   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000012   | 01GO | PRIVATE | 500        | oris         | fede  |
            | 0000000013   | 01PL | PRIVATE | 500        | oris         | john  |
        And I have added the following assets of type org.interwatch.watchain.Order
            | orderId | watch      | orderer | orderStatus |
            | 0       | 0000000000 | fede    | SUBMITTED   |
            | 4       | 0000000005 | fede    | ACCEPTED    |
            | 5       | 0000000006 | fede    | READY       |
            | 6       | 0000000007 | fede    | ON_DELIVERY |
            | 7       | 0000000008 | fede    | DELIVERED   |
            | 8       | 0000000009 | fede    | RECEIVED    |
            | 9       | 0000000010 | fede    | PAID        |
        And I have added the following assets of type org.interwatch.watchain.WatchListing
            | listingId | reservePrice | description                 | state    | watch      |
            | 02        | 1000         | a test auction for my watch | FOR_SALE | 0000000013 |
        And I have issued the participant org.interwatch.watchain.Manufacturer#oris with the identity oris1
        And I have issued the participant org.interwatch.watchain.Collector#fede with the identity fede1
        And I have issued the participant org.interwatch.watchain.Courier#dhl with the identity dhl1
        And I have issued the participant org.interwatch.watchain.Insurer#allianz with the identity allianz1
        And I have issued the participant org.interwatch.watchain.Auctioneer#sothebys with the identity sothebys1
        And I have issued the participant org.interwatch.watchain.Fca#fca with the identity fca1
    
    Scenario: Insurer can read all of the watches
        When I use the identity allianz1
        Then I should have the following assets of type org.interwatch.watchain.Watch
            | serialNumber | ref  | status | retailPrice | manufacturer | owner |
            | 0000000000   | 01ST | NEW    | 500         | oris         | oris  | 
            | 0000000001   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000003   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000004   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000005   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000006   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000007   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000008   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000009   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000010   | 01ST | NEW    | 500         | oris         | oris  |
            | 0000000012   | 01GO | PRIVATE | 500        | oris         | fede  |
            | 0000000013   | 01PL | PRIVATE | 500        | oris         | john  |

    Scenario: FCA can read all of the participants
        When I use the identity fca1
        Then I should have the following participant of type org.interwatch.watchain.Manufacturer
            | userId | availableBalance | stock | sold | totalProduction |
            | oris   | 500.0            | 10    | 1    | 11              |
        And I should have the following participants of type org.interwatch.watchain.Collector
            | userId | availableBalance |
            | fede   | 9000.0           |
            | john   | 0.0              |
        And I should have the following participant of type org.interwatch.watchain.Courier
            | userId |
            | dhl    |
        And I should have the following participant of type org.interwatch.watchain.Insurer
            | userId  |
            | allianz |
        And I should have the following participant of type org.interwatch.watchain.Auctioneer
            | userId   |
            | sothebys |
        And I should have the following participant of type org.interwatch.watchain.Fca
            | userId |
            | fca    |

    Scenario: Manufacturer can create new watches that he owns
        When I use the identity oris1
        And  I add the following asset of type org.interwatch.watchain.Watch
            | serialNumber | ref  | status | retailPrice | manufacturer | owner |
            | 0000000002   | 01ST | NEW    | 500         | oris         | oris  |
        And I update the following participant of type org.interwatch.watchain.Manufacturer
            | userId | availableBalance | stock | sold | totalProduction |
            | oris   | 500.0            | 11    | 1    | 12              |
        Then I should have the following asset of type org.interwatch.watchain.Watch
            | serialNumber | ref  | status | retailPrice | manufacturer | owner |
            | 0000000002   | 01ST | NEW    | 500         | oris         | oris  |
        And I should have the following participant of type org.interwatch.watchain.Manufacturer
            | userId | availableBalance | stock | sold | totalProduction |
            | oris   | 500.0            | 11    | 1    | 12              |

    Scenario: Collector can not create new watches
        When I use the identity fede1
        And I add the following asset of type org.interwatch.watchain.Watch
            | serialNumber | ref  | status | retailPrice | manufacturer | owner |
            | 0000000011   | 01ST | NEW    | 500         | oris         | oris  |
        Then I should get an error matching /does not have .* access to resource/
    
    Scenario: Collector can order a new watch
        When I use the identity fede1
        And I add the following asset of type org.interwatch.watchain.Order
            | orderId | watch      | orderer | orderStatus |
            | 1       | 0000000001 | fede    | SUBMITTED   |
        And I update the following asset of type org.interwatch.watchain.Watch
            | serialNumber | ref  | status     | retailPrice | manufacturer | owner |
            | 0000000001   | 01ST | ORDERED    | 500         | oris         | oris  |
        And I update the following participant of type org.interwatch.watchain.Collector
            | userId | availableBalance | frozenBalance |
            | fede   | 8500.0           | 500.0         |
        Then I should have the following asset of type org.interwatch.watchain.Order
            | orderId | watch      | orderer | orderStatus |
            | 1       | 0000000001 | fede    | SUBMITTED   |
        And I should have the following asset of type org.interwatch.watchain.Watch
            | serialNumber | ref  | status     | retailPrice | manufacturer | owner |
            | 0000000001   | 01ST | ORDERED    | 500         | oris         | oris  |
        And I should have the following participant of type org.interwatch.watchain.Collector
            | userId | availableBalance | frozenBalance |
            | fede   | 8500.0           | 500.0         |

   # Scenario: Collector can submit a create order transaction
     #   When I use the identity fede1
     ##   And I submit the following transaction of type org.interwatch.watchain.CreateOrder
     #       | order |
     #       | 3     |
     #   Then I should have the following asset of type org.interwatch.watchain.Order
      #      | orderId | watch      | orderer | orderStatus |
      #      | 3       | 0000000003 | fede    | SUBMITTED   |


   # Scenario: Collector can not order a watch that have already been ordered
      #  When I use identity fede1
        #And I add the following asset of type org.interwatch.watchain.Order
          #  | orderId | watch      | orderer | orderStatus |
          #  | 1       | 0000000000 | fede    | SUBMITTED   |
        #Then I should get an error matching /Sorry, this watch with serial number 0000000000 has already been ordered/

    Scenario: Manufacturer can accept an order
        When I use the identity oris1
        And I submit the following transaction of type org.interwatch.watchain.AcceptOrder
            | order   | orderStatus |
            | 0       | ACCEPTED    |
        Then I should have the following asset of type org.interwatch.watchain.Order
            | orderId | watch      | orderer | orderStatus |
            | 0       | 0000000000 | fede    | ACCEPTED    |

    Scenario: Manufacturer can mark an order ready for delivery 
        When I use the identity oris1
        And I submit the following transaction of type org.interwatch.watchain.OrderReady
            | order   | orderStatus |
            | 4       | READY       |
        Then I should have the following asset of type org.interwatch.watchain.Order
            | orderId | watch      | orderer | orderStatus |
            | 4       | 0000000005 | fede    | READY       |
    Scenario: Courier can create a contract that assigns him deliver an order
        When I use the identity dhl1
        And I add the following asset of type org.interwatch.watchain.Contract
            | contractId | order | courier | terminated |
            | 1          | 5     | dhl     | false      |
        And I update the following asset of type org.interwatch.watchain.Order
            | orderId | watch      | orderer | orderStatus | courierAssigned |
            | 5       | 0000000006 | fede    | ON_DELIVERY | true            |
        Then I should have the following asset of type org.interwatch.watchain.Contract
            | contractId | order | courier | terminated |
            | 1          | 5     | dhl     | false      |
        And I should have the following asset of type org.interwatch.watchain.Order
            | orderId | watch      | orderer | orderStatus | courierAssigned |
            | 5       | 0000000006 | fede    | ON_DELIVERY | true            |
    Scenario: The courier records a transaction when the order is delivered
        When I use the identity dhl1
        And I submit the following transaction of type org.interwatch.watchain.Delivered 
            | order |
            | 6     |
        Then I should have the following asset of type org.interwatch.watchain.Order
            | orderId | watch      | orderer | orderStatus |
            | 6       | 0000000007 | fede    | DELIVERED   |
    
    Scenario: Collector can create a Watch Listing asset for a watch he/she owns
        When I use the identity fede1
        And I add the following asset of type org.interwatch.watchain.WatchListing
            | listingId | reservePrice | description                 | state    | watch      |
            | 01        | 1000         | a new auction for my watch  | FOR_SALE | 0000000012 |
        Then I should have the following asset of type org.interwatch.watchain.WatchListing
            | listingId | reservePrice | description                 | state     | watch      |
            | 01        | 1000         | a new auction for my watch  | FOR_SALE  | 0000000012 |
    Scenario: Auctioneer can terminate the bidding for an auction
        When I use the identity sothebys1
        And I update the following asset of type org.interwatch.watchain.WatchListing
            | listingId | reservePrice | description                 | state    | watch      |
            | 02        | 1000         | a test auction for my watch | SOLD     | 0000000013 |
        And I update the following asset of type org.interwatch.watchain.Watch
            | serialNumber | ref  | status     | lastPrice | retailPrice | manufacturer | owner |
            | 0000000013   | 01PL | PRIVATE    | 3780.0      | 500         | oris         | fede  |
        And I update the following participants of type org.interwatch.watchain.Collector
            | userId | availableBalance |
            | fede   | 5220.0           |
            | john   | 3780.0           |
        Then I should have the following asset of type org.interwatch.watchain.WatchListing
            | listingId | reservePrice | description                 | state    | watch      |
            | 02        | 1000         | a test auction for my watch | SOLD     | 0000000013 |
        And I should have the following asset of type org.interwatch.watchain.Watch
            | serialNumber | ref  | status     | lastPrice | retailPrice | manufacturer | owner |
            | 0000000013   | 01PL | PRIVATE    | 3780.0      | 500         | oris         | fede  |
        And I should have the following participant of type org.interwatch.watchain.Collector
            | userId | availableBalance |
            | fede   | 5220.0           |
            | john   | 3780.0           |

        






     
