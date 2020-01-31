### Tracker - Angular and Firebase GPS Tracker

#### Application Description
A base application for showing device location history information in table and Google Map layouts.

Potential users may be fleet managers who would subscribe to the locating service provided by the application.
Pricing can be determined by built-in administrator controllable service constraints. A detailed description
of the user interface is available in the Screenshots.pdf file.

##### Serverless Application
The base application is serverless in that it uses the Google Firebase/Firestore cloud database for access
to location data as well as user and account information. Location data may be provided by any device capable
of accessing Firestore. A sample Android application for this purpose is provided by https://github.com/lvhellgren/LayTrax.

##### Single Page Application
Tracker is a single page Angular application written in TypeScript taking advantage of Angular features
such as routing, reactive processing, templating, Material Design, etc.

##### Responsive Design
Tracker employs Angular Flex-Layout to automatically format UI layouts to fit various screen sizes.

##### Modular Development
Tracker is designed for modular development. The Core module provides sign-in capability and basic features
for use by other modules. The Setup module manages users and accounts as well as the relationships
between these entities. Application-specific functionality may be implemented by creating new modules 
(or by extending existing placeholder modules).

##### Authentication
User authentication is provided through the Firebase Java Web Token implementation. Users can sign in using
email and password authentication and also through Auth0 identity providers, such as Google.

##### Users and Accounts
Users and accounts have a many-to-many relationship, so that a given user may have access to one or more
accounts and an account may have one or more users.

##### User Roles
User permissions are governed through rules defined in the Firestore database, so that a given user may,
for example, be assigned create, update, or read roles for accessing data collections in the database. Users
having access to multiple accounts may be given different permissions depending on the account.

##### The Principal Account
Only users in the special Principal account and with create permission can create new accounts. These users will
also create the initial user for a new account. An account user with create permission can then create
additional users for that account but for that account only.

A user ID created from Tracker must be a valid email address available to the intended user. Initially, a
randomly generated, unknown password is created. The user signing in for the first time will then need to use 
the Create or Reset Password option to create a known password.

##### License
MIT

##### Third Party Software Used
| Software             | License          |
|----------------------|------------------|
| AGM                  | MIT              |
| Angular              | MIT              |
| Angular Flex-Layout  | MIT              |
| Angular Material     | MIT              |
| Angular rxjs         | MIT              |
| Core-js              | MIT              |
| Hammerjs             | MIT              |
| NG Bootstrap         | MIT              |
| JavaScript           | Apache 2.0       |
| Kendo UI for Angular | License required |
| TypeScript           | Apache 2.0       |
| Zone.js              | MIT              |
