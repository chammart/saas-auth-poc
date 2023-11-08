# Learn more about federated sign-in with an external IdP

[Sign in with federation](/docs/manage-tenant-and-users.md#3-Sign-in with federation) Now we have confirmed that you can log in to your application using IAM Identity Center as your IdP. Behind the scenes, the tenant service creates an external IdP configuration for the tenant within the user pool. This document explains its contents.

## 1. Registering an external IdP with your tenant

[Configuring an external IdP](/docs/manage-tenant-and-users.md#31-External-idp- settings)Now, in order to connect using SAML, we registered the metadata URL of IAM Identity Center, which is an IdP, in the application.

![](/docs/images/idp-management.png)

At this time, a `POST` request is made to `/api/idp-mapping` behind the scenes. [Click here]As described in (calling /docs/authorize.md#1-lambda-authorizer-), the result of this API call is [TenantRegisterIdpService](/docs/tenant-service.md#tenantregisteridpservice), which is part of the tenant service. is called.

Inside of `TenantRegisterIdpService`, to register an external IdP in the user pool, use the [CreateIdentityProvider](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_CreateIdentityProvider.html) API. calling. At this time, the external IdP name is assigned according to the naming convention `external-idp-<tenant ID>`.

When registering an IdP, you can map the values held by the external IdP to the user pool. In this demo application, the attribute (SAML Assertion / OIDC Claims) specified in the `email attribute mapping` parameter is mapped to `custom:emailFromIdp` of the user pool.

In order to perform mapping, write permissions must be set for the user attribute on the application client. However, in this demo application, as explained in [Onboarding](/docs/onboarding.md#22 - Checking the user pool), the user is required to [UpdateUserAttiributes](https://docs.aws.amazon.com/cognito -user-identity-pools/latest/APIReference/API_UpdateUserAttributes.html) Writing to the `email` attribute is prohibited on the application client side in order to prevent email addresses from being changed using API etc. For this reason, we use dedicated attributes for attributes mapped from the external IdP side.

![](/docs/images/tenant-register-idp-service.png)

After registering the external IdP, configure the application client for the tenant to use the above IdP. This allows each application client to use [federation endpoints](https://docs.aws.amazon.com/cognito/latest/developerguide/federation-endpoints.html) to achieve sign-in with an external IdP. It will be. Amazon Cognito allows you to specify which external IdP to use for each app client, but here we have a one-to-one correspondence between the external IdP of `tenant-a` and the app client. This ensures that even a tenant administrator or a user with administrative privileges for her IdP can only sign in within that tenant.

Finally, `TenantRegisterIdpService` updates the `federationEnabled` value in the `authconfig` record on DynamoDB. This value is used only to display the ``Log in with external ID'' button on the front end of the demo application.


## 2. Behavior during federated sign-in

When you access the login page for each tenant, [same as normal sign-in] (/docs/sign-in.md#3-Sign-in), the `/api/authconfig/<tenantId>` endpoint contains user pools and applications. Query the client's ID. At this time, the value of `federationEnabled` mentioned above can be obtained as a Boolean, so we will draw the [Login with external ID] button based on this.

[Login.tsx](/web/src/page/Login.tsx#87)
```typescript
...
<Button variation="primary" onClick={() => Auth.federatedSignIn({customProvider: `external-idp-${tenantId}`})}>
  <Trans
    i18nKey="sign-in-page.general.federatedSignIn"
  />
</Button>
...
```
When you click Log in with external ID, the Amplify Library's Auth.federatedSignIn()(https://aws-amplify.github.io/amplify-js/api/classes/authclass.html#federatedsignin) is called. , you are redirected to the Cognito [authorization endpoint](https://docs.aws.amazon.com/ja_us/cognito/latest/developerguide/authorization-endpoint.html). In this case, her IdP name specified in `customProvider` is passed as the `identity_provider` parameter and we are directly redirected to her IdP's sign-in page.

When the [Log in with external ID](../saas-auth-frontend/src/App.tsx#L114) button is clicked, `Auth.federatedSignIn()` is called and Cognito's [authorization endpoint]( You will be redirected to https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/authorization-endpoint.html). In this case, her IdP name specified in `customProvider` is passed as the `identity_provider` parameter and we are directly redirected to her IdP's sign-in page.

Note that Cognito's authorization endpoint is hosted in the Cognito domain specified in `Auth.configure()`. Auth.configure() has the following settings based on the values obtained from the backend.

```tsx
{
  region: REGION,
  userPoolId: USER_POOL_ID,
  userPoolWebClientId: APP_CLIENT_ID,
  oauth: {
    domain: OAUTH_ENDPOINT,
    scope: ['openid'],
    redirectSignIn: `${CURRENT_DOMAIN}/login/${tenantId}`,
    redirectSignOut: `${CURRENT_DOMAIN}/logout`,
    responseType: 'code',
  },
}
```

After successful on-screen authentication with the external IdP, you are redirected to Amazon Cognito again. After that, [a new user profile is created in the user pool](https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/cognito-user-pools-saml-idp-authentication.html). You will then be redirected to the application's login screen. For details, see [SAML User Pools IDP Authentication Flow](https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/cognito-user-pools-saml-idp-authentication.html) and [ OIDC User Pools IDP Authentication Flow](https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/cognito-user-pools-oidc-flow.html).

You will be redirected to the application login screen with the authorization code issued by Amazon Cognito (`code=XXXXX` at the end of the URL). When `Amplify.configure()` is called, Amplify Library automatically uses the authorization code to make a request to Amazon Cognito's token endpoint and obtain an access token, ID token, and refresh token.

As mentioned in [Post-sign-in screen](/docs/sign-in.md#4-Post-sign-in screen), if there is no association between tenant and user on DynamoDB, [Lambda trigger before token generation] An error occurs while executing ](/src/cdk/functions/cognito-pre-token-generation/index.ts) and application sign-in fails. There, a user in the external IdP was first created on her Cognito user pool using [His Lambda trigger after user confirmation] (/src/cdk/functions/cognito-post-confirmation/index.ts) At the right time, he also linked tenants on DynamoDB.
