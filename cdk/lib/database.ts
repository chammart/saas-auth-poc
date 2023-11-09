/**
 *  Copyright Folksdo.com, Inc. or its affiliates. All Rights Reserved.
 */

// Imports
import { RemovalPolicy } from "aws-cdk-lib";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

// Construct
// -
// This construct provisions tables: orders, carts, products.
//
export class ShcDatabase extends Construct {
  public readonly tenantTable: ddb.ITable;
  public readonly userTable: ddb.ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // create tables
    this.tenantTable = this.createTable(this, "shc-tenant-table");
    this.userTable = this.createTable(this, "shc-user-table");
  }

  /**
   * Helper function to shorten Table creation boilerplate as we have 6 in this stack
   * @param scope
   * @param tableName
   */
  createTable(scope: Construct, tableName: string): ddb.Table {
    const dbTable = new ddb.Table(scope, tableName, {
      tableName: tableName,
      partitionKey: {
        name: "pk",
        type: ddb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: ddb.AttributeType.STRING,
      },
      stream: ddb.StreamViewType.NEW_AND_OLD_IMAGES, //enable DB stream
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
    });
    return dbTable;
  }
}
