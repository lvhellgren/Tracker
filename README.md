### Leapfire - Angular and Firebase App Development Leapstart

Leapfire is a running application base for building responsive, serverless enterprise applications requiring
user and account management capabilities. Leapfire can be extended with domain-specific functionality and out of
the box comes with the following features:

#####Serverless Application
The base application is serverless in that it uses the Google Firebase/Firestore cloud database for access
to user and account information.

#####Single Page Application
Leapfire is a single page Angular application written in TypeScript taking advantage of Angular features
such as routing, reactive processing, templating, Material Design, etc.

#####Responsive Design
Leapfire employs Angular Flex-Layout to automatically format UI layouts to fit various screen sizes.

#####Modular Development
Leapfire is designed for modular development. The Core module provides sign-in capability and basic features
for use by other modules. The Structure module manages users and accounts as well as the relationships
between these entities. Application-specific functionality may be implemented by creating new modules 
(or by extending existing placeholder modules).

#####Authentication
User authentication is provided through the Firebase Java Web Token implementation. Users can sign in using
email and password authentication and also through Auth0 identity providers, such as Google.

#####Users and Accounts
Users and accounts have a many-to-many relationship, so that a given user may have access to one or more
accounts and an account may have one or more users.

#####User Roles
User permissions are governed through rules defined in the Firestore database, so that a given user may,
for example, be assigned create, update, or read roles for accessing data collections in the database. Users
having access to multiple accounts may be given different permissions depending on the account.

#####The Hub Account
Only users in the special Hub account and with create permission can create new accounts. These users will
also create the initial user for a new account. An account user with create permission can then create
additional users for that account but for that account only.

A user ID created from Leapfire must be a valid email address available to the intended user. Initially, a
randomly generated, unknown password is created. The user signing in for the first time will then need to use 
the Create or Reset Password option to create a known password.

#####Demo Application Sign In with Google
First-time users signing in to the demo Leapfire application with Google will be assigned a new account named the
same as their user ID (email address). They will also have a CREATOR role on that account.
