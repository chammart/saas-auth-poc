# Multitenancy with Amazon Cognito

When handling multiple tenants with Amazon Cognito, you need to consider how much customization of authentication requirements is allowed for each tenant, and how to handle the authorization side logic. You may also consider combining multiple methods, taking into account the expected number of tenants.

## Customizing authentication requirements per tenant

When trying to customize authentication requirements for each tenant in Amazon Cognito, there are ways to divide user pools and application clients for each tenant.

### User pool-based multi-tenancy

Dividing user pools is the option that provides the most flexible settings for each tenant. This is effective when it is necessary to customize password policies and MFA settings for each tenant, or when authenticating using a hosted UI customized for each tenant. If you use this method, you will need to create a user pool during the onboarding process every time a new tenant is added. In addition, during authentication, it is necessary to identify which user pool to use for each tenant.

### Application client-based multi-tenancy

Typically, when multiple web or mobile applications use the same Cognito user pool, you create an application client for each application. You can set the identity provider, authentication flow, and token expiration date for each application client. Application client-based multi-tenancy is an application of this to multi-tenancy.

This method is useful if you want to use a separate external identity provider for each tenant, or if you want to map one Cognito user to multiple tenants. Similar to user pool-based multi-tenancy, an application client must be created during the onboarding process each time a new tenant is added, and it is also necessary to identify which application client to use for each tenant during authentication. is needed. In addition, a separate mechanism is required to map signed-in users and tenants.

This demo application shows an example of implementing customization based on application client-based multi-tenancy.

If the application requirements do not require customization for each tenant as described above, there are cases where a single user pool and application client are shared. In this case as well, for the purpose of authorization and monitoring by tenant, customize the token using the following custom attributes to identify which tenant the user belongs to.

## Customizing the token

In SaaS applications, in addition to information on which user a request belongs to, information on which tenant the request is being sent under is used not only for access control, but also for monitoring and metering for each tenant (usage amount for billing purposes). It is also required for tenant separation (implementing boundaries with other tenants), etc.

By storing information about which tenant is being sent in a token (JSON Web Token) in advance and propagating the request throughout the application, it is possible to simply implement access control logic on the application side after authentication. can. When customizing JWT in Amazon Cognito, there are ways to use custom attributes and Lambda Trigger, but this sample application introduces an example that uses Lambda Trigger.

For more information click here[This article](https://aws.amazon.com/jp/builders-flash/202301/cognito-multi-tenant-saas/)or[document](https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/multi-tenant-application-best-practices.html)Please refer to the.
