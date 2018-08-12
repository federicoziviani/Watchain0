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
        And I have added the following participants of type org.watchain.firstHand.Manufacturer
            | userId | availableBalance |
            | oris   | 0.0              |
        And I have added the following participants of type org.watchain.firstHand.Collector
            | userId | availableBalance |
            | fede   | 9000.0           |
        And I have added the following participants of type org.watchain.firstHand.Courier
            | userId | 
            | dhl    |
        And I have added the following participants of type org.watchain.firstHand.Insurer
            | userId  | 
            | allianz |
        And I have added the following participants of type org.watchain.firstHand.Auctioneer
            | userId   | 
            | sothebys |
        And I have added the following participants of type org.watchain.firstHand.Fca
            | userId | 
            | fca    |
        And I have added the following assets of type org.watchain.firstHand.Watch
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
        And I have added the following assets of type org.watchain.firstHand.Order
            | orderId | watch      | orderer | orderStatus |
            | 0       | 0000000000 | fede    | SUBMITTED   |
            | 4       | 0000000005 | fede    | ACCEPTED    |
            | 5       | 0000000006 | fede    | READY       |
            | 6       | 0000000007 | fede    | ON_DELIVERY |
            | 7       | 0000000008 | fede    | DELIVERED   |
            | 8       | 0000000009 | fede    | RECEIVED    |
            | 9       | 0000000010 | fede    | PAID        |
        
        And I have issued the participant org.watchain.firstHand.Manufacturer#oris with the identity oris1
        And I have issued the participant org.watchain.firstHand.Collector#fede with the identity fede1
        And I have issued the participant org.watchain.firstHand.Courier#dhl with the identity dhl1
        And I have issued the participant org.watchain.firstHand.Insurer#allianz with the identity allianz1
        And I have issued the participant org.watchain.firstHand.Auctioneer#sothebys with the identity sothebys1
        And I have issued the participant org.watchain.firstHand.Fca#fca with the identity fca1
    
    Scenario: Manufacturer can add assets that he owns
        When I use the identity oris1
        And  I add the following asset of type org.watchain.firstHand.Watch
             | serialNumber | ref  | status | retailPrice | manufacturer | owner |
             | 0000000002   | 01ST | NEW    | 500         | oris         | oris  |    
        Then I should have the following asset of type org.watchain.firstHand.Watch
             | serialNumber | ref  | status | retailPrice | manufacturer | owner |
             | 0000000002   | 01ST | NEW    | 500         | oris         | oris  | 
    
    Scenario: Collector can order a new watch
        When I use the identity fede1
        And I add the following asset of type org.watchain.firstHand.Order
            | orderId | watch      | orderer | orderStatus |
            | 1       | 0000000001 | fede    | SUBMITTED   |
        And I update the following asset of type org.watchain.firstHand.Watch
            | serialNumber | ref  | status     | retailPrice | manufacturer | owner |
            | 0000000001   | 01ST | ORDERED    | 500         | oris         | oris  |
        And I update the following participant of type org.watchain.firstHand.Collector
            | userId | availableBalance | frozenBalance |
            | fede   | 8500.0           | 500.0         |
        Then I should have the following asset of type org.watchain.firstHand.Order
            | orderId | watch      | orderer | orderStatus |
            | 1       | 0000000001 | fede    | SUBMITTED   |
        And I should have the following asset of type org.watchain.firstHand.Watch
            | serialNumber | ref  | status     | retailPrice | manufacturer | owner |
            | 0000000001   | 01ST | ORDERED    | 500         | oris         | oris  |
        And I should have the following participant of type org.watchain.firstHand.Collector
            | userId | availableBalance | frozenBalance |
            | fede   | 8500.0           | 500.0         |

   # Scenario: Collector can submit a create order transaction
     #   When I use the identity fede1
     ##   And I submit the following transaction of type org.watchain.firstHand.CreateOrder
     #       | order |
     #       | 3     |
     #   Then I should have the following asset of type org.watchain.firstHand.Order
      #      | orderId | watch      | orderer | orderStatus |
      #      | 3       | 0000000003 | fede    | SUBMITTED   |


   # Scenario: Collector can not order a watch that have already been ordered
      #  When I use identity fede1
        #And I add the following asset of type org.watchain.firstHand.Order
          #  | orderId | watch      | orderer | orderStatus |
          #  | 1       | 0000000000 | fede    | SUBMITTED   |
        #Then I should get an error matching /Sorry, this watch with serial number 0000000000 has already been ordered/

    Scenario: Manufacturer can accept an order
        When I use the identity oris1
        And I submit the following transaction of type org.watchain.firstHand.AcceptOrder
            | order   | orderStatus |
            | 0       | ACCEPTED    |
        Then I should have the following asset of type org.watchain.firstHand.Order
            | orderId | watch      | orderer | orderStatus |
            | 0       | 0000000000 | fede    | ACCEPTED    |

    Scenario: Manufacturer can mark an order ready for delivery 
        When I use the identity oris1
        And I submit the following transaction of type org.watchain.firstHand.OrderReady
            | order   | orderStatus |
            | 4       | READY       |
        Then I should have the following asset of type org.watchain.firstHand.Order
            | orderId | watch      | orderer | orderStatus |
            | 4       | 0000000005 | fede    | READY       |
    Scenario: Courier can create a contract that assigns him deliver an order
        When I use the identity dhl1
        And I add the following asset of type org.watchain.firstHand.Contract
            | contractId | order | courier | terminated |
            | 1          | 5     | dhl     | false      |
        And I update the following asset of type org.watchain.firstHand.Order
            | orderId | watch      | orderer | orderStatus | courierAssigned |
            | 5       | 0000000006 | fede    | ON_DELIVERY | true            |
        Then I should have the following asset of type org.watchain.firstHand.Contract
            | contractId | order | courier | terminated |
            | 1          | 5     | dhl     | false      |
        And I should have the following asset of type org.watchain.firstHand.Order
            | orderId | watch      | orderer | orderStatus | courierAssigned |
            | 5       | 0000000006 | fede    | ON_DELIVERY | true            |
    Scenario: The courier records a transaction when the order is delivered
        When I use the identity dhl1
        And I submit the following transaction of type org.watchain.firstHand.Delivered 
            | order |
            | 6     |
        Then I should have the following asset of type org.watchain.firstHand.Order
            | orderId | watch      | orderer | orderStatus |
            | 6       | 0000000007 | fede    | DELIVERED   |

        






     
