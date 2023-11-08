# Onboarding

Call tenant service APIs to provision new tenants and users.


## 1. Creating tenants and users

### 1.1 When using GUI (Option 1)

Access [AWS Step Functions](https://console.aws.amazon.com/states/home#/statemachines), select the state machine starting with `TenantOnboardService`, and press [Start Execution].

After entering the following information in `Input`, click [Start Execution].
```json
{
   "tenantId": "tenant-a",
   "tenantName": "Tenant A Co., Ltd.",
   "tier": "PREMIUM"
}
```

![](/docs/images/sfn-execute.png)

Verify that the execution status shows "Success" and the tenant is created.

`TenantOnboardingService` registers the new tenant's information with Amazon DynamoDB and creates a new application client in the Cognito user pool. `TenantOnboardingService` manages the number of tenants per user pool and attempts to create a user pool if one is not available.

**Note:** Amazon Cognito has quotas, such as limits on the number of application clients per user pool. For more information, see [Multi-tenancy with Amazon Cognito](/docs/cognito-multi-tenancy.md).

Similarly, register another tenant based on the input below.
```json
{
   "tenantId": "tenant-b",
   "tenantName": "Tenant B Co., Ltd.",
   "tier": "BASIC"
}
```

Similarly, run the state machine starting with `UserInviteService` and create a user based on the following inputs.

***user-a***
```json
{
  "tenantId": "tenant-a",
  "displayName": "user-a",
  "email": "<YOUR EMAIL>",
  "role": "admin"
}
```

***user-b***
```json
{
  "tenantId": "tenant-b",
  "displayName": "user-b",
  "email": "<YOUR EMAIL>",
  "role": "admin"
}
```

`UserInviteService` registers the user's information in the Cognito user pool and DynamoDB table. Once you have confirmed that the tenant and user have been created correctly, move on to [2. Confirm the created tenant user] (#2 - Confirm the created tenant user).

## 1.2 When using CLI (Option 2)

Get the Step Functions state machine name from the output of CloudFormation Stack and run it.
````bash
TenantOnboardService=$(aws cloudformation describe-stacks --stack-name SaaSAuthDemoStack --output text --query "Stacks[*].Outputs[?OutputKey=='TenantOnboardServiceArn'].OutputValue")
UserInviteService=$(aws cloudformation describe-stacks --stack-name SaaSAuthDemoStack --output text --query "Stacks[*].Outputs[?OutputKey=='UserInviteServiceArn'].OutputValue")
```

Creating tenant-a
````bash
INPUT="{\"tenantId\": \"tenant-a\", \"tenantName\": \"Tenant A Co., Ltd.\", \"tier\": \"PREMIUM\"}"
aws stepfunctions start-execution --state-machine-arn $TenantOnboardService --input $INPUT
````
Creating tenant-b
````bash
INPUT="{\"tenantId\": \"tenant-b\", \"tenantName\": \"Tenant B Co., Ltd.\", \"tier\": \"BASIC\"}"
aws stepfunctions start-execution --state-machine-arn $TenantOnboardService --input $INPUT
````
Creating user-a (Please enter your email address in `<YOUR EMAIL>`.)
````bash
INPUT="{\"tenantId\": \"tenant-a\", \"displayName\": \"user-a\", \"role\": \"admin\", \"email\": \"<YOUR EMAIL>\"}"
aws stepfunctions start-execution --state-machine-arn $UserInviteService --input $INPUT
````
Creating user-b (Please enter your email address in `<YOUR EMAIL>`.)
````bash
INPUT="{\"tenantId\": \"tenant-b\", \"displayName\": \"user-b\", \"role\": \"admin\", \"email\": \"<YOUR EMAIL>\"}"
aws stepfunctions start-execution --state-machine-arn $UserInviteService --input $INPUT
```

After executing the command, move on to confirming the created tenant user.

## 2. Check the created tenant user

### 2.1 Checking records on DynamoDB
Visit the [Amazon DynamoDB console](https://console.aws.amazon.com/dynamodbv2/home#tables) and check the records for the table starting with **SaaSAuthDemoStack-MainTable**.

![](/docs/images/ddb-table.png)

In addition to the created UserPool record, you can see that two tenant records and one user record have been registered.

### 2.2 Checking the user pool
Access the [Amazon Cognito console](console.aws.amazon.com/cognito/v2/idp/user-pools) and check the user pool starting with `saasdemo-`.
Verify that the user you created and the application client for the tenant exist.

![User list](/docs/images/users.png)
![Application client list](/docs/images/app-client.png)

In this demo application, each user is created with the name `<tenantId>#<email>`. This is because tenant IDs are intentionally assigned to multiple tenants to prevent duplication of user names when users are registered with the same email address. During the actual sign-in, the tenant ID is automatically assigned through on-screen processing without the user being aware of it.

**Note:** In B2B SaaS applications, you may want to prohibit users from changing their email address to a free email address, etc. after they have been invited by the administrator. This application also does not assume that users will change their email addresses.

Creation of tenants and users is now complete.