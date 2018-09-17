# How to setup your own wiki site?

## Prerequisites

- An app service in [azure](https://portal.azure.com)

## Steps

### 1. Create your own branch, please name it as `_site/{YOUR_SITE_NAME}`.

![](/public/img/HowToSetup/CreateBranch.png)

### 2. Go to the azure portal, find your app service, and click into the setting of `Deployment source`.

- Choose Source: `Visual Studio Team Services`
- Choose your account: `msasg`
- Choose a project: `DM.SLAPI.wiki`
- Choose branch: `{the_branch_you_just_created}`
- Performance Test: `Not Configured`

![](/public/img/HowToSetup/AzureConfig.png)

### 3. Specify the site configuration

The config file of whole site is placed here: `/config/root.yml`, it's easily to understand. Some settings need to be mentioned:

```
application:
  environment: azure          # DO NOT change it
  branch: master              # Change to your own branch name
  ariaToken: xxxxxxx          # DO remember to change it to your own Aria token if you wanna enable Aria log, delete this line or leave it empty otherwise.
  showContributeGuide: false  # For most case this can be false
  enableSearch: true          # Set it to ture if you want to enable whole site search
  banner:                     # The black banner on the top, which is a particular feature for Shared Data products, delete it(along with its child "productname") if you don't need.
    productname: SLAPI
```

### 4. Prepare your own documents

> It's highly recomended to do this step in your local git repo, and push to remote repo when you finished.

- Delete existing internal static sites `/_site/UDT`;
- Delete all the existing docs under folder `/resources/docs/*/` and `/resources/images/*/`. (Just delete the files and keep the empty folder);
- Put all your documents under folder `/resources/docs`, all your images under folder `/resources/images`;
- Reference your documents in `/config/root.yml`.

### 5. Check in all your changes and see the new wiki!

Once you check in all your changes, they will be auto deployed to azure website in minutes.