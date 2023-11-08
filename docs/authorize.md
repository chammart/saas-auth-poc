# JWT Authorization using attributes of

[Tenant and user management](manage-tenant-and-users.md)behind the scenes API Gateway Resource operations are being performed via.
Control plane APIs are typically called as needed inside SaaS applications. In the demo application, we perform detailed authorization using the attributes included in the user's ID token, specify the scope of the tenant to which the user belongs, and directly call the tenant service API.

![Architecture](/docs/images/architecture.png)

In SaaS applications, access control must be performed based on multiple factors such as tenant, contract plan, user role, etc. In the demo application, the API Gateway is reached as shown in (6) to (8) in the architecture diagram above. The request you make is verified with Amazon Verified Permissions via Lambda Authorizer to confirm that the user has permission to call the API. Amazon Verified Permissions uses user roles and attributes to define policy-based access controls for fine-grained access control.

## 1. Invoking Lambda Authorizer

By using Authorizer in API Gateway, you can control access based on the token etc. given to the HTTP Header before sending the request to the integration destination. In particular, by using Lambda Authorizer, you can implement authorization based on the request method, path, and attributes in the token. Authorizer has a function to cache authorized results for a certain period of time. This prevents your Lambda function from being called on every request. The cache key can be specified as the Authorizer's identity source.

In this application, we will implement access control according to user attributes as follows.

|Action|Method|Resource Path|Services to be integrated | Accessible users|
|---|---|---|---|---|
|DescribeTenantInfo|GET|/api/tenantinfo|[TenantDescribeService](/docs/tenant-service.md#tenantdescribeservice)|All users|
|UpdateTenantInfo|PUT|/api/tenantinfo|[TenantUpdateService](/docs/tenant-service.md#tenantupdateservice)|`admin` User only|
|InviteUser|POST|/api/user|[UserInviteService](/docs/tenant-service.md#userinviteservice)|`admin` User only|
|ListUser|GET|/api/user|[UserListService](/docs/tenant-service.md#userlistservice)|All users|
|DescribeUser|GET|/api/user/{userId}|[UserDescribeService](/docs/tenant-service.md#userdescribeservice)|All users|
|UpdateUserProfile|PUT|/api/user/{userId}/profile|[UserUpdateService](/docs/tenant-service.md#userupdateservice)|* userId == sub in the case of：All users<br>* userId != sub in the case of：`admin` user|
|UpdateUserRole|PUT|/api/user/{userId}/role|[UserUpdateService](/docs/tenant-service.md#userupdateservice)|* userId == sub in the case of：**All usersNot accessible**<br>* userId != sub in the case of：`admin` User only|
|DeleteUser|DELETE|/api/user/{userId}|[UserDeleteService](/docs/tenant-service.md#userdeleteservice)|* userId == sub in the case of：**All usersNot accessible**<br>* userId != sub in the case of：`admin` User only|
|CreateIdpMapping|POST|/api/idp-mapping|[TenantRegisterIdpService](/docs/tenant-service.md#tenantregisteridpservice)|`PREMIUM` Tier and<br>`admin` User only|
|DescribeIdpMapping|GET|/api/idp-mapping|[TenantDescribeIdpService](/docs/tenant-service.md#tenantdescribeidpservice)|`admin` User only|
|UpdateIdpMapping|PUT|/api/idp-mapping|[TenantUpdateIdpService](/docs/tenant-service.md#tenantupdateidpservice)|`PREMIUM` Tier and<br>`admin` User only|
|DeleteIdpMapping|DELETE|/api/idp-mapping|[TenantDeregisterIdpService](/docs/tenant-service.md#tenantderegisteridpservice)|`admin` User only|

Lambda Authorizer Validate ID tokens and perform authorization according to requests as program code in `if` Although it is possible to implement using branching by statements, it is possible that new conditions other than those mentioned above may be added in the future. You may need to deny certain actions if the user is not using her MFA. Additionally, new features and tenant contract plans (tiers) may be added.
Amazon Verified Permissions allows you to transparently manage these authorization logics in units of policies. By relying on Amazon Verified Permissions to make authorization decisions, you can flexibly respond to future feature additions.

## 2. Amazon Verified Permissions Validating the token with

Amazon Verified Permissions is integrated with Amazon Cognito and[isAuthorizedWithToken](https://docs.aws.amazon.com/verifiedpermissions/latest/apireference/API_IsAuthorizedWithToken.html) By calling , it is possible to verify the token of the user pool specified in advance as the `ID source` and perform access control based on the attributes contained in that token.

[Amazon Verified Permissions console](https://console.aws.amazon.com/verifiedpermissions/)access the CloudFormation Select the policy store deployed by .
Select an identity source from the menu on the left.[Onboarding](/docs/onboarding.md#22-Check user pool)You can confirm that the user pool you checked at the time is registered.

![Identity Source](/docs/images/avp-id-source.png)

Next, select Schema from the left menu and you will see `Resource` and `User` as entity types. Click on `User` to see the contents of the `User` entity type to which the user pool was mapped. `sub` / `userRole` / `tenantTier` / `tenantId` are set as entity attributes. These entity attributes are variables that can be used in policies, and by passing an ID token to the `isAuthorizedWithToken` API, it is possible to retrieve the value from the same name claim name of the ID token and reference it in the policy. .

![Schema](/docs/images/avp-schema.png)

Next, let's review the policy. Amazon Verified Permissions controls access by defining policies called Cedar. You can view the defined policies by selecting Policies from the left menu of the console. Select the radio button for the policy with `admin users can manage tenant, idp and users` in the description and confirm that the following policy is displayed.

```
permit (
    principal,
    action in [
        ApiAccess::Action::"UpdateTenantInfo",
        ApiAccess::Action::"InviteUser",
        ApiAccess::Action::"UpdateUserProfile",
        ApiAccess::Action::"UpdateUserRole",
        ApiAccess::Action::"DeleteUser",
        ApiAccess::Action::"CreateIdpMapping",
        ApiAccess::Action::"UpdateIdpMapping",
        ApiAccess::Action::"DescribeIdpMapping",
        ApiAccess::Action::"DeleteIdpMapping"
    ],
    resource
)
when {
    principal.userRole == "admin"
};
```

This policy indicates that the information of the user tenant with the role `userRole == admin`, the user, and the IdP information can be manipulated. Next, check the policy that says `prevent users from deleting themselves or changing their own privileges`.

```
forbid (
    principal,
    action in [
        ApiAccess::Action::"UpdateUserRole",
        ApiAccess::Action::"DeleteUser"
    ],
    resource
)
when {
    resource.pathParameters has userId &&
    resource.pathParameters.userId == principal.sub
};
```

This policy expresses the logic that satisfies the condition `userId == sub in the case of: All usersNot accessible` in the table above.

As mentioned above, Amazon Verified Permissions allows you to manage application access control in a scalable manner using policies. Detail is [SaaS AuthN/Z Workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/9180bbda-7747-4b8f-ac05-14e7f258fcea/ja-JP/50-lab3/53-verified-permissions) Please refer to the.

## 3. Lambda Authorizer の出力の利用

API Gateway allows you to pass the output of Authorizer to downstream applications. For example, you can use API Gateway's mapping template function to convert the tenantId value output by Lambda Authorizer into the data passed to the backend, add it to a header, or record it in API Gateway's access log. Masu. For details, please refer to [here](https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html).

In this demo application, API Gateway directly calls the backend tenant service, and at this time, the `tenantId` output from Lambda Authorizer is passed as a parameter. For example, in the `POST /api/user` API, the parameter when calling [UserInviteService](/docs/tenant-service.md#userinviteservice) now gets the value from `$context.authorizer.tenantId`. I am.

```json
#set($root = $input.path('$'))
#set($root.REQUEST_DATA = {})
#set($requestData = $root.REQUEST_DATA)
#set($requestData.tenantId = "$context.authorizer.tenantId")
#set($requestData.displayName = $input.path('$.displayName'))
#set($requestData.email = $input.path('$.email'))
#set($requestData.role = $input.path('$.role'))
{
  "stateMachineArn": "arn:aws:states:<region>:<account-id>:stateMachine:UserInviteServiceXXXXXXXX",
  "input": "$util.escapeJavaScript($input.json('$.REQUEST_DATA')).replaceAll("\\'","'")"
}
```

This allows applications to use Tenant Service functionality with a narrow scope to the tenant ID included in the JWT.