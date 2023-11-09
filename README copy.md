# SaaS AuthN/Z Demo with Amazon Cognito

SaaS AuthN/Z Demo is a sample application that explains the concepts of authentication/authorization on AWS for SaaS products and implements them with Amazon Cognito.

Disclaimer: This application [SaaS AuthN/Z Workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/9180bbda-7747-4b8f-ac05-14e7f258fcea) This is educational content that is intended to be used in、Amazon Cognito The purpose is to learn the features of Amazon Verified Permissions and design patterns in SaaS. It is not intended to be used in production operations, so please consider carefully before using some of the code assets in this repository for your own products.

## table of contents
* [Concept](#Concept)
* [Deployment method](#Deployment method)
* [Architecture](#architecture)
* [Scenario](#Scenario)
  * [Execute onboarding process](/docs/onboarding.md)
  * [Sign in to tenant](/docs/sign-in.md)
  * [Manage tenants and users](/docs/manage-tenant-and-users.md)
    * [Authorization using JWT attributes](/docs/authorize.md)
    * [Details about signing in using an external IdP](/docs/federation-signin.md)
* [Delete environment](#Delete environment)
* others
  * [Tenant service details](/docs/tenant-service.md)
  * [Amazon Cognito Multi-tenant strategy in](/docs/cognito-multi-tenancy.md)

## Concept

Implementing authentication and authorization for B2B SaaS applications requires additional considerations compared to authentication and authorization for regular web applications. For example, depending on the security policy of the user company, authentication options may be required, or tenant administrators may need the ability to manage other users. Backend applications require access control based on multiple factors such as tenant separation, contract plans, and user roles. We also need to consider how to efficiently handle authorization information scattered in various databases and microservices.

![AccessPattern](/docs/images/saas-access-control-pattern.png)

Regarding access control, [this article](https://aws.amazon.com/jp/builders-flash/202108/saas-authorization-implementation-pattern/) As introduced in , by first including this information scattered in various IdPs and databases in a JSON Web Token (JWT) and then sending it to the backend, the authorization process on the backend side is simplified. can be realized.

This sample application shows an example of how to implement these SaaS authentication concepts using Amazon Cognito and Amazon Verified Permissions.

## How to deploy

[Deployment method](/docs/how-to-deploy.md)Please follow the steps to deploy.

## Architecture

![Architecture](/docs/images/architecture.png)

|Service name|Description|
|--|--|
|Tenant Service | A microservice that controls core functions related to SaaS authentication and tenant management. For details on the tenant services that exist in this demo application,[here](/docs/tenant-service.md)Please refer to。|
|identity service<br> (Amazon Cognito)|Provides functions for user authentication and linking with tenants. This application uses an implementation that allocates application clients for each tenant, and supports authentication using an email address and password and authentication using an external IdP for each tenant.<br>**remarks :** Within a user pool,[resource quota](https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/limits.html#resource-quotas)As stated in , there are upper limits on the number of application clients and identity providers. In the demo application, a new user pool is created for each tenant, which is the default quota of 300 external identity providers per user pool, so that the number of tenants is not constrained by resource quotas. For more information[Amazon Cognito Multi-tenancy in](/docs/cognito-multi-tenancy.md)Please refer to.|
|Front-end application | A front-end application that provides authentication screens and user management screens. We provide APIs and screens for authentication and user/tenant management. The user/tenant management API validates the authenticated user's token and then calls the backend tenant service according to the user's privileges. This demo application uses Amazon API Gateway's AWS service integration and mapping template to narrow down the scope to the tenant to which the requesting user belongs and directly call the tenant service.|

## scenario

The demo application assumes the following scenario.

1. The operator of the SaaS provider adds the tenant's environment and an administrator user within the tenant.
2. The tenant service adds an administrator user to the identity service Amazon Cognito.
3. The tenant's admin user receives an invitation email from her Amazon Cognito.
4. The tenant administrator user accesses the URL in the invitation email and the front-end application login form is displayed. At this time, obtain information about which user pool and application client to use for each tenant.
5. The tenant administrator user authenticates to Amazon Cognito and obtains a token.
6. If the sign-in is successful, the front-end application grants the obtained token and calls the API.
7. Verify that the signed-in user is authorized to make the requested API call using Lambda Authorizer and Amazon Verified Permissions.
8. If the API call is allowed, API Gateway will scope the call to the backend service to the tenant. In this application, API Gateway makes direct requests to tenant services, but it is also common for Lambda functions placed after API Gateway to call core services in the control plane.

For technical details on each phase, please refer to the documents below.

* [**Perform onboarding process**](/docs/onboarding.md) :Add new tenants and users. In the architecture diagram above, processes (1) to (3) apply.
* [**Sign in to tenant**](/docs/sign-in.md) :  Access the application as a tenant user, sign in to the user pool, and obtain a token containing the tenant context. In the architecture diagram above, processes (4) to (5) apply.
* [**Tenant and user management**](/docs/manage-tenant-and-users.md) : As an administrator user within the tenant, make backend API calls and manage users within the tenant. In the architecture diagram above, processes (6) to (8) apply.
  * [**JWTAuthorization using attributes of**](/docs/authorize.md) : By using the tenant and user attributes embedded in the token, we control that only the permitted APIs are executed.
  * [**Sign in with an external IdP**](/docs/federation-signin.md) : Add sign-in with your tenant's own IdP.

## Delete environment

* `cdk destroy` Please delete the stack using the command
* Delete the user pool created by the demo application
* Please delete the settings information of the linked external IdP

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

