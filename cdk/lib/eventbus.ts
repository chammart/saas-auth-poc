/**
 *  Copyright Folksdo.com, Inc. or its affiliates. All Rights Reserved.
 */

// Imports
import { EventBus } from "aws-cdk-lib/aws-events";

import { Construct } from "constructs";

export interface ShcEventbusProps {}

export class ShcEventbus extends Construct {
  // Public variables

  // the event bus
  public readonly eventBus: EventBus;
  // static eventBus: EventBus;

  // Constructor
  constructor(scope: Construct, id: string, props: ShcEventbusProps) {
    super(scope, id,);

    // ----------------------------------------
    //   Eventbus
    // ----------------------------------------
    this.eventBus = new EventBus(this, "shc-eventBus", {
      eventBusName: "shc-eventBus",
    });
  }
}
