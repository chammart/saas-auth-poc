# Tenant Service API Reference

A microservice that provides functionality for managing the tenant itself and its users.

* Inside each service, the GetParameter API of Systems Manager Parameter Store is called. Calls to this API are limited to 40 TPS by default. If your workload expects more than this number of requests and you need to retrieve parameters on every request, similar to the demo application, you can use the [Increase throughput limit to 10,000 TPS] (https://docs) option at the AWS account and Region level. .aws.amazon.com/ja_jp/systems-manager/latest/userguide/parameter-store-throughput.html) is possible. However, additional costs will apply.
For details, please see the [Pricing page](https://aws.amazon.com/jp/systems-manager/pricing/).

### List of services

|Service name|Overview|
|---|---|
|[TenantOnboardService](#tenantonboardservice)|This service is called when adding a new tenant. Deploys an application client for the tenant and writes tenant metadata to DynamoDB. |
|[TenantDescribeService](#tenantdescribeservice)|A service for referencing the attributes of the specified tenant. Queries DynamoDB for tenant information. |
|[TenantUpdateService](#tenantupdateservice)|A service for updating the attributes of the specified tenant. Update tenant information on DynamoDB. |
|[TenantDeleteService](#tenantdeleteservice)|A service responsible for deleting the specified tenant and related users. Delete application client and external IdP information for the tenant, as well as records related to the tenant on DynamoDB. |
|[TenantAuthConfigService](#tenantauthconfigservice)|A service to provide authentication settings for the specified tenant. Returns tenant user pool/application client information stored on DynamoDB. |
|[UserInviteService](#userinviteservice)|A service that invites new users to the specified tenant. Create a user in the Cognito user pool and create a record on DynamoDB to link it with the tenant. |
|[UserListService](#userlistservice)|A service that obtains a list of users belonging to the specified tenant. Queries DynamoDB for a list of attributes of users belonging to the tenant. |
|[UserDescribeService](#userdescribeservice)|A service that retrieves information about the specified user in the specified tenant. Queries DynamoDB for the attributes of the user. |
|[UserUpdateService](#userupdateservice)|A service that updates the information of the specified user in the specified tenant. Update the attributes of the user on DynamoDB. |
|[UserDeleteService](#userdeleteservice)|A service that deletes the specified user in the specified tenant. Delete the user from the Cognito user pool and delete the user's record on DynamoDB. |
|[TenantRegisterIdpService](#tenantregisteridpservice)|A service that links an external IdP to the specified tenant. Register the identity provider in the Cognito user pool and link it to the tenant's application client. |
|[TenantDescribeIdpService](#tenantdescribeidpservice)|A service for viewing external IdP information associated with the specified tenant. Displays detailed settings of the external identity provider associated with the tenant. |
|[TenantUpdateIdpService](#tenantupdateidpservice)|A service for updating external IdP information associated with the specified tenant. Update the detailed settings of the external identity provider associated with the tenant. |
|[TenantDeregisterIdpService](#tenantderegisteridpservice)|A service for deleting external IdP information associated with the specified tenant. Remove the tenant's external identity provider from the Cognito user pool and update the application client settings. |

---
## TenantOnboardService

This service is called when adding a new tenant. After selecting an available user pool, issue an application client for the tenant and write tenant metadata to DynamoDB. If no user pool is available, create a new user pool.

### Input
```json
{
  "tenantId": <string>,
  "tenantName": <string>,
  "tier": "BASIC" | "PREMIUM"
}
```

* `tenantId` (required): Specify the identifier of the newly created tenant. tenantId cannot be changed later.
* `tenantName` (required): Specify a user-friendly name for the tenant.
* `tier` (required): Specify the tenant tier.

### Output
```json
{
  "tenantId": <string>,
  "tenantName": <string>,
  "tier": "BASIC" | "PREMIUM"
}
```

If the tenant is successfully added, the input value will be returned as is.

### Errors
  * *InvalidRequestError* : Error that occurs when the input from the user is not an acceptable value.
  * *TenantAlreadyExistsError* : Tenant ID is already in use. Please use another tenant ID.
  * *InternalServerError* : There is a problem with internal processing.
---
## TenantDescribeService

This is a service for referencing the attributes of the specified tenant. Queries DynamoDB for tenant information.

### Input
```json
{
  "tenantId": <string>
}
```

* `tenantId` (required) : 参照するテナントの識別子を指定します。

### Output
```json
{
  "tenantId": <string>,
  "tenantName": <string>,
  "tier": "BASIC" | "PREMIUM"
}
```

Returns the attributes of the created tenant.
* `tenantId`: Tenant identifier. tenantId cannot be changed later.
* `tenantName` : User-friendly name of the tenant.
* `tier`: An identifier representing the tenant tier.

### Errors
  * *InvalidRequestError* : Error that occurs when the input from the user is not an acceptable value.
  * *TenantNotFoundError* : A tenant with the specified tenant ID does not exist.

---
## TenantUpdateService

This is a service for updating the attributes of the specified tenant. Update tenant information on DynamoDB.

### Input
```json
{
  "tenantId": <string>,
  "tenantName": <string>,
  "tier": "BASIC" | "PREMIUM"
}
```

* `tenantId` (required): Identifier of the tenant to be updated.
* `tenantName` (optional): Specify if you want to change the user-friendly name of the tenant.
* `tier` (optional): Specify when changing the tenant tier.

Requests must include `tenantName` and/or `tier`.

### Output

```json
{
  "tenantId": <string>,
  "tenantName": <string>,
  "tier": "BASIC" | "PREMIUM"
}
```

Returns the updated tenant attributes. For details, please refer to Output of [TenantDescribeService](#tenantdescribeservice).

### Errors
  * *InvalidRequestError* : Error that occurs when the input from the user is not an acceptable value.
  * *TenantNotFoundError* : A tenant with the specified tenant ID does not exist.
  * *InternalServerError* : There is a problem with internal processing.

---
## TenantDeleteService

This service is responsible for deleting specified tenants and related users. Delete application client and external IdP information for the tenant, as well as records related to the tenant on DynamoDB.

### Input
```json
{
  "tenantId": <string>
}
```

* `tenantId` (required): Identifier of the tenant to be deleted.

### Output
```json
{
  "result": "success"
}
```
If the tenant deletion is successful, a fixed response will be returned.

### Errors
  * *InvalidRequestError* : Error that occurs when the input from the user is not an acceptable value.
  * *TenantNotFoundError* : A tenant with the specified tenant ID does not exist.
  * *InternalServerError* : There is a problem with internal processing.

---
## TenantAuthConfigService

This service provides authentication settings for the specified tenant. Returns tenant user pool/application client information stored on DynamoDB.

### Input
```json
{
  "tenantId": <string>
}
```

* `tenantId` (required): Identifier of the tenant to obtain authentication settings.

### Output
```json
{
  "tenantId": <string>,
  "userpool": {
    "oauth": {
      "scope": [
        "openid"
      ],
      "responseType": "code",
      "domain": <string>
    },
    "userPoolWebClientId": <string>,
    "region": <string>,
    "userPoolId": <string>
  },
  "flags": {
    "federationEnabled": <boolean>
  },
}
```

* `tenantId`: Tenant identifier.
* `userpool`: A parameter required when making Amazon Cognito API calls on the front-end application side.
* `flags`: Flags indicating whether the authentication option is enabled in the tenant.

### Errors
  * *InvalidRequestError* : Error that occurs when the input from the user is not an acceptable value.
  * *TenantNotFoundError* : A tenant with the specified tenant ID does not exist.

---
## UserInviteService

This is a service that invites new users to a specified tenant. Create a user in the Cognito user pool and create a record on DynamoDB to link it with the tenant.

### Input
```json
{
  "tenantId": <string>,
  "email": <string>,
  "displayName": <string>,
  "role": "admin" | "member"
}
```
* `tenantId` (required): Tenant identifier.
* `email` (required): Specify the user's email address. After creating a user, an email containing an initial password will be sent to the email address you specified. You will also be prompted for it when you sign in to the application. The email address cannot be changed later.
* `displayName` (required): User-friendly name for the user.
* `role` (required): A fixed value that represents the user's role within the tenant. The `admin` user has the authority to manage tenant information.

### Output
```json
{
  "userId": <string>,
  "tenantId": <string>,
  "email": <string>,
  "displayName": <string>,
  "role": "admin" | "member",
  "type": "NATIVE_USER"
}
```

Returns the attributes of the created user. For details, please refer to Output of [UserDescribeService](#userdescribeservice).

### Errors
  * *InvalidRequestError* : Error that occurs when the input from the user is not an acceptable value.
  * *TenantNotFoundError* : A tenant with the specified tenant ID does not exist.
  * *UserExistError* : The same user already exists in the tenant.
  * *InternalServerError* : There is a problem with internal processing.

---
## UserListService

This is a service that obtains a list of users belonging to a specified tenant. Queries DynamoDB for a list of attributes of users belonging to the tenant.

### Input
```json
{
  "tenantId": <string>
}
```

* `tenantId` (required) : ユーザーの一覧を取得するテナントの識別子です。

### Output
```json
[
  {
    "tenantId": <string>,
    "userId": <string>,
    "email": <string>,
    "displayName": <string>,
    "role": "admin" | "member",
    "type": "NATIVE_USER" | "FEDERATION_USER"
  },
  ...
]
```

Returns a list of attributes of users belonging to the tenant. For details on individual items, please refer to Output of [UserDescribeService](#userdescribeservice).

### Errors
  * *InvalidRequestError* : Error that occurs when the input from the user is not an acceptable value.
  * *TenantNotFoundError* : A tenant with the specified tenant ID does not exist.

---
## UserDescribeService

This is a service that retrieves information about a specified user in a specified tenant. Queries DynamoDB for the attributes of the user.

### Input
```json
{
  "tenantId": <string>,
  "userId": <string>
}
```

* `tenantId` (required): Identifier of the tenant to which the user belongs.
* `userId` (required): Identifier of the user whose information you want to obtain.

### Output
```json
{
  "tenantId": <string>,
  "userId": <string>,
  "email": <string>,
  "displayName": <string>,
  "role": "admin" | "member",
  "type": "NATIVE_USER" | "FEDERATION_USER"
}
```

* `tenantId`: Identifier of the tenant to which the user belongs.
* `userId`: User identifier.
* `email`: User's email address.
* `displayName`: The user name displayed on the screen.
* `role`: A fixed value that represents the user's role within the tenant. The `admin` user has the authority to manage tenant information.
* `type` : Represents the user's source. `NATIVE_USER` represents a user invited via `UserInviteService`, and `FEDERATION_USER` represents a user federated from an external ID.

### Errors
  * *InvalidRequestError* : Error that occurs when the input from the user is not an acceptable value.
  * *UserNotFoundError* : The tenant with the specified tenant ID/user ID does not exist.

---
## UserUpdateService

This service updates the information of the specified user in the specified tenant. Update the attributes of the user on DynamoDB.

### Input
```json
{
  "tenantId": <string>,
  "userId": <string>,
  "displayName": <string>,
  "role": "admin" | "member"
}
```

* `tenantId` (required): Identifier of the tenant to which the user belongs.
* `userId` (required): Identifier of the user whose attributes you want to update.
* `displayName` (optional): Specify this to change the user name displayed on the screen.
* `role` (optional): Specify when changing the user's role within the tenant.

### Output
```json
{
  "tenantId": <string>,
  "userId": <string>,
  "email": <string>,
  "displayName": <string>,
  "role": "admin" | "member",
  "type": "NATIVE_USER" | "FEDERATION_USER"
}
```

Returns all attributes of the updated user. For details on individual items, please refer to Output of [UserDescribeService](#userdescribeservice).

### Errors
  * *InvalidRequestError* : Error that occurs when the input from the user is not an acceptable value.
  * *UserNotFoundError* : The tenant with the specified tenant ID/user ID does not exist.
  * *InternalServerError* : There is a problem with internal processing.

---
## UserDeleteService

This service deletes the specified user in the specified tenant. Delete the user from the Cognito user pool and delete the user's record on DynamoDB.

### Input
```json
{
  "tenantId": <string>,
  "userId": <string>
}
```

* `tenantId` (required): Identifier of the tenant to which the user belongs.
* `userId` (required): Identifier of the user you want to delete.

### Output
```json
{
  "result": "success"
}
```

If the tenant deletion is successful, a fixed response will be returned.

### Errors
  * *InvalidRequestError* : Error that occurs when the input from the user is not an acceptable value.
  * *TenantNotFoundError* : A tenant with the specified tenant ID does not exist.
  * *UserNotFoundError* : The tenant with the specified tenant ID/user ID does not exist.

---
## TenantRegisterIdpService

This is a service that links an external IdP to a specified tenant. Register the identity provider in the Cognito user pool and link it to the tenant's application client.

### Input
```json
{
  "tenantId": <string>,
  "providerType": "SAML" | "OIDC",
  "providerDetails": {
    "MetadataURL": <string>,
    "MetadataFile": <string>,
    "oidc_issuer": <string>,
    "client_id": <string>,
    "client_secret": <string>,
    "attributes_request_method": "GET" | "POST",
    "authorize_scopes": <string>
},
  "emailMappingAttribute": <string>
}
```

* `tenantId` (required): The identifier of the tenant to which the external IdP is linked.
* `providerType` (required): Specify the method of cooperation with external IdP. For more information, see Adding a SAML provider in the Amazon Cognito documentation (https://docs.aws.amazon.com/en_us/cognito/latest/developerguide/cognito-user-pools-saml-idp.html) and Add](https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/cognito-user-pools-oidc-idp.html).
* `providerDetails` (required): Specify required parameters for each `providerType`.
   * If `providerType == "SAML"`, specify the metadata document required for the SAML connection with one of the following parameters:
     * `MetadataFile` (optional): Writes the identity provider's SAML metadata document directly.
     * `MetadataURL` (optional): Specify the URL where the identity provider's SAML metadata document is located. Amazon Cognito automatically downloads and uses the metadata document from the URL you specify.
   * If `providerType == "OIDC"`, specify the following parameters.
     * `oidc_issuer` (required): Specify the Issuer Identifier of OpenID Provider. The value represented by the `iss` claim of the ID Token. Information such as authorization, tokens, userInfo and various JWKS endpoints are retrieved from the Issuer's `/.well-known/openid-configuration` endpoint. Although not supported in this demo application, Amazon Cognito allows you to directly specify an authorization endpoint or token endpoint if you do not have this endpoint.
     * `client_id` (required): Specify the client ID issued by OpenID Provider.
     * `client_secret` (required): Specify the client secret issued by OpenID Provider.
     * `attributes_request_method` (required): Specify the method used when Amazon Cognito sends a request to the OpenID Provider's userInfo endpoint, either `GET` or `POST`.
     * `authorize_scopes`: Specify the `scopes` that the application requests from the OpenID Provider, separated by spaces. `openid` is required.
* `emailMappingAttribute` (required): Specify the attribute that indicates the user's email address among the user attributes linked from the external IdP with SAML and OpenID Connect. This attribute is reflected in the email attribute of users created in Amazon Cognito and in the email attribute of users in your application. Please note that email addresses federated from external IdPs are not verified by Amazon Cognito. When using this for logic such as authorization within an application, it is the application's responsibility to send an email to confirm that the user has an email address. **

### Output
```json
{
  "tenantId": <string>,
  "providerType": "SAML" | "OIDC",
  "providerDetails": {
    "MetadataURL": <string>,
    "MetadataFile": <string>,
    "oidc_issuer": <string>,
    "client_id": <string>,
    "client_secret": <string>,
    "attributes_request_method": "GET" | "POST",
    "authorize_scopes": <string>
},
  "emailMappingAttribute": <string>
}
```

Once the external IdP is configured, it will respond with the parameters you entered.

### Errors
  * *InvalidRequestError* : Error that occurs when the input from the user is not an acceptable value.
  * *TenantNotFoundError* : A tenant with the specified tenant ID does not exist.
  * *InternalServerError* : There is a problem with internal processing.
  * *SettingAlreadyExistsError* : Settings for the external IdP already exist. Only one IdP can be linked to one tenant.

### Remarks
Logging from the state machine is disabled to prevent sensitive data from being logged. No execution log is left, but this is intentional.

---
## TenantDescribeIdpService

This is a service for viewing external IdP information associated with a specified tenant. Displays detailed settings of the external identity provider associated with the tenant.

### Input
```json
{
  "tenantId": <string>
}
```

* `tenantId` (required): Identifier of the tenant to obtain external IdP information.

### Output
```json
{
  "tenantId": <string>,
  "providerType": "SAML" | "OIDC",
  "providerDetails": {
    "MetadataURL": <string>,
    "MetadataFile": <string>,
    "oidc_issuer": <string>,
    "client_id": <string>,
    "client_secret": <string>,
    "attributes_request_method": "GET" | "POST",
    "authorize_scopes": <string>
},
  "emailMappingAttribute": <string>
}
```
Returns settings related to external IdP. For details of each parameter, please refer to Input and Output of [TenantRegisterIdpService](#tenantregisteridpservice).

### Errors
  * *InvalidRequestError* : Error that occurs when the input from the user is not an acceptable value.
  * *TenantNotFoundError* : A tenant with the specified tenant ID does not exist.
  * *SettingNotExistsError* : Settings for external IdP do not exist.
  * *InternalServerError* : There is a problem with internal processing.

### Remarks
Logging from the state machine is disabled to prevent sensitive data from being logged. No execution log is left, but this is intentional.

---
## TenantUpdateIdpService

This is a service for updating external IdP information linked to a specified tenant. Update the detailed settings of the external identity provider associated with the tenant.

### Input
```json
{
  "tenantId": <string>,
  "providerDetails": {
    "MetadataURL": <string>,
    "MetadataFile": <string>,
    "oidc_issuer": <string>,
    "client_id": <string>,
    "client_secret": <string>,
    "attributes_request_method": "GET" | "POST",
    "authorize_scopes": <string>
},
  "emailMappingAttribute": <string>
}
```

* `tenantId` (required)
* `providerDetails` (required)
* `emailMappingAttribute` (required)

Specify each external IdP parameter to update. For details of each parameter, please refer to Input of [TenantRegisterIdpService](#tenantregisteridpservice).
`providerType` cannot be changed in TenantUpdateIdpService. If you want to change `providerType` later, please delete the external IdP settings and then create them again.

### Output
```json
{
  "tenantId": <string>,
  "providerType": "SAML" | "OIDC",
  "providerDetails": {
    "MetadataURL": <string>,
    "MetadataFile": <string>,
    "oidc_issuer": <string>,
    "client_id": <string>,
    "client_secret": <string>,
    "attributes_request_method": "GET" | "POST",
    "authorize_scopes": <string>
},
  "emailMappingAttribute": <string>
}
```

Returns the updated external IdP attribute value. For details of each attribute, please refer to the Output of [TenantRegisterIdpService](#tenantregisteridpservice).

### Errors
  * *InvalidRequestError* : Error that occurs when the input from the user is not an acceptable value.
  * *TenantNotFoundError* : A tenant with the specified tenant ID does not exist.
  * *SettingNotExistsError* : Settings for external IdP do not exist.
  * *InternalServerError* : There is a problem with internal processing.

### Remarks
Logging from the state machine is disabled to prevent sensitive data from being logged. No execution log is left, but this is intentional.

---
## TenantDeregisterIdpService

This is a service for deleting external IdP information associated with a specified tenant. Remove the tenant's external identity provider from the Cognito user pool and update the application client settings.

### Input
```json
{
  "tenantId": <string>
}
```

* `tenantId` (required): Identifier of the tenant whose external IdP information is to be deleted.

### Output
```json
{
  "result": "success"
}
```

Once the external IdP settings have been deleted, a fixed response will be returned.

### Errors
  * *InvalidRequestError* : Error that occurs when the input from the user is not an acceptable value.
  * *TenantNotFoundError* : A tenant with the specified tenant ID does not exist.
  * *SettingNotExistsError* : Settings for external IdP do not exist.
  * *InternalServerError* : There is a problem with internal processing.
